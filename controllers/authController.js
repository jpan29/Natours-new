const User = require('../models/userModel')
const { promisify } = require('util')
const jwt = require('jsonwebtoken')
const catchAsync = require('../utils/catchAsync')
const AppError = require('../utils/appError')
const Email = require('../utils/email')
const crypto = require('crypto')
const signToken = id => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  })

}

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id)
  const options = {
    expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
    secure: process.env.NODE_ENV === 'prduction',
    httpOnly: true
  }
  res.cookie('jwt', token, options)
  // remove password from output
  user.password = undefined
  res.status(statusCode).json({
    status: 'success',
    token,
    data: user
  })
}
exports.signup = catchAsync(async (req, res, next) => {
  // const newUser = await User.create(req.body)
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
    confirmPassword: req.body.confirmPassword,
    passwordChangedAt: req.body.passwordChangedAt
  })
  const url = `${req.protocol}://${req.get('host')}/me`
  await new Email(newUser, url).sendWelcome()
  createSendToken(newUser, 201, res)


})

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body
  if (!email || !password) return next(new AppError('please provide email and password', 400))

  const user = await User.findOne({ email }).select('+password')
  if (!user || !await user.correctPassword(password, user.password)) return next(new AppError('incorrect email or password', 401))

  createSendToken(user, 200, res)

})

exports.protect = catchAsync(async (req, res, next) => {
  // check if token is exsits
  let token
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1]
  }
  if (req.cookies.jwt) token = req.cookies.jwt
  if (!token) return next(new AppError('You are not log in,please log in to get access', 401))
  // verify token
  const decode = await promisify(jwt.verify)(token, process.env.JWT_SECRET)


  // check if user exits
  const currentUser = await User.findById(decode.id)
  if (!currentUser) return next(new AppError('The user does no longer exist', 401))

  // check if user change password after the token is issued
  if (currentUser.changePasswordAfter(decode.iat)) return next(new AppError('password recently has been changed,please login again', 401))
  // grant access to protected route
  req.user = currentUser
  res.locals.user = currentUser
  next()
})
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) return next(new AppError('you do not have a permission to perform this action', 403))
    next()
  }

}
exports.forgotPassword = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email })
  if (!user) return next(new AppError('no user with this email', 404))

  const resetToken = await user.createPasswordResetToken()
  await user.save({
    validateBeforeSave: false
  })
  const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`

  try {

    await new Email(user, resetURL).sendPasswordReset()
    res.status(200).json({
      status: 'success',
      message: 'Token sent to email'
    })
  } catch (err) {
    console.log(err)
    user.passwordResetToken = undefined
    user.passwordResetExpires = undefined
    await user.save({
      validateBeforeSave: false
    })
    return next(new AppError('there was an error sending the email, please try again later', 500))
  }
})


exports.resetPassword = catchAsync(async (req, res, next) => {
  //  get user

  const hashToken = crypto.createHash('sha256').update(req.params.token).digest('hex')

  const user = await User.findOne(
    {
      passwordResetToken: hashToken,
      passwordResetExpires: { $gt: Date.now() }
    })

  // check if token is expired
  if (!user) return next(new AppError('token is invalid or expired', 400))
  // update changePasswordAt
  user.password = req.body.password
  user.confirmPassword = req.body.confirmPassword
  user.passwordResetToken = undefined
  user.passwordResetExpires = undefined

  await user.save()

  // log the user in,send jwt
  createSendToken(user, 200, res)

})
exports.updatePassword = catchAsync(async (req, res, next) => {
  // get user
  const user = await User.findById(req.user.id).select('+password')

  // check original password
  console.log(await user.correctPassword(req.body.currentPassword, user.password))
  if (!await user.correctPassword(req.body.currentPassword, user.password))
    return next(new AppError('please provide correct current password', 400))

  //  update password
  user.password = req.body.newPassword
  user.confirmPassword = req.body.confirmNewPassword

  await user.save()

  // log user in , send jwt
  createSendToken(user, 200, res)

})
// only for render pages,no errors
exports.isLoggedIn = async (req, res, next) => {

  if (req.cookies.jwt) {
    try {
      const decode = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET)


      // check if user exits
      const currentUser = await User.findById(decode.id)
      if (!currentUser) return next()

      // check if user change password after the token is issued
      if (currentUser.changePasswordAfter(decode.iat)) return next()
      // there is a logged in user
      res.locals.user = currentUser

      return next()
    } catch (err) {
      return next()
    }
  }
  next()
}

exports.logout = (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 1000),
    httpOnly: true
  })
  res.status(200).json({
    status: 'success'
  })
}