const User = require('../models/userModel')
const multer = require('multer')
const sharp = require('sharp')
const AppError = require('../utils/appError')
const catchAsync = require('../utils/catchAsync')
const { deleteOne, updateOne, getOne, getAll } = require('./handlerFactory')


// const multerStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'public/img/users')
//   },
//   filename: (req, file, cb) => {
//     const ext = file.mimetype.split('/')[1]
//     cb(null, `user-${req.user.id}-${Date.now()}.${ext}`)
//   }
// })
const multerStorage = multer.memoryStorage()

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image'))
    return cb(null, true)

  return cb(new AppError('Please upload only image', 400), false)
}

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter
})

exports.uploadPhoto = upload.single('photo')
exports.resizePhoto = catchAsync(async (req, res, next) => {

  if (!req.file) return next()
  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`
  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`)

  next()
})



const filterObj = (obj, ...allowedFields) => {
  let newObj = {}
  Object.keys(obj).forEach(el => {
    if (allowedFields.includes(el)) {
      newObj[el] = obj[el]
    }
  })
  return newObj

}
// router handler


exports.updateMe = catchAsync(async (req, res, next) => {

  console.log(req.file, req.body)
  if (req.body.password || req.body.confirmPassword)
    return next(new AppError('this route is not for password update,please use /updataPassword', 400))

  const filteredBody = filterObj(req.body, 'name', 'email')
  if (req.file) filteredBody.photo = req.file.filename
  const user = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true
  })


  res.status(200).json({
    status: 'success',
    data: user

  })
})
exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false })

  res.status(204).json({
    status: 'success',
    data: null

  })
})
exports.getMe = (req, res, next) => {
  req.params.id = req.user.id
  next()
}
exports.getAllUsers = getAll(User)
exports.findOneUser = getOne(User)
exports.deleteUser = deleteOne(User)
exports.updateUser = updateOne(User)