const mongoose = require('mongoose')
const bookingSchema = new mongoose.Schema({
  tour: {
    type: mongoose.Schema.ObjectId,
    ref: 'Tour',
    required: [true, 'must have a tour id']
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'must have a user id']

  },
  price: {
    type: Number,
    required: [true, 'must have a price']

  },
  createAt: {
    type: Date,
    default: Date.now()
  },
  paid: {
    type: Boolean,
    default: true
  }

})
bookingSchema.pre(/^find/, function (next) {
  this.populate('user').populate({
    path: 'tour',
    select: 'name'
  })
  next()
})
const Booking = mongoose.model('Booking', bookingSchema)
module.exports = Booking