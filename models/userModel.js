const mongoose = require('mongoose')
const validator = require('validator')
const crypto = require('crypto')
const bcrypt = require('bcryptjs')
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'please tell us your name']

  },
  email: {
    type: String,
    required: [true, 'please tell us your email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'please provide a valid email']

  },
  role: {
    type: String,
    enum: ['user', 'admin', 'guide', 'lead-guide'],
    default: 'user'

  },
  photo: {
    type: String,
    default: 'default.jpg'
  },
  password: {
    type: String,
    required: [true, 'please input a password'],
    minlength: 8,
    select: false

  },
  confirmPassword: {
    type: String,
    required: [true, 'please confirm your password'],
    validate: {

      // only works on create and save
      validator: function (el) {
        return el === this.password

      },
      message: 'Passwords are not the same'

    }

  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false
  }

})

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next()
  // hash current password
  // 12 is cost parameter, how cpu intention this operstion will be
  this.password = await bcrypt.hash(this.password, 12)
  // delete confirm password field
  this.confirmPassword = undefined
})

userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next()
  this.passwordChangedAt = Date.now() - 1000
  next()
})
// instance method --available for all docs
userSchema.methods.correctPassword = async function (candidatePwd, userPwd) {
  return await bcrypt.compare(candidatePwd, userPwd)

}


userSchema.methods.changePasswordAfter = function (JwtTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10)
    return changedTimestamp > JwtTimestamp
  }

  return false

}
userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex')
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest('hex')

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000
  return resetToken
}



userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } })
  next()

})
const User = mongoose.model('User', userSchema)
module.exports = User

