const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
const Booking = require('../models/bookingModel')
const Tour = require('../models/tourModel')

const catchAsync = require('../utils/catchAsync')
const { deleteOne, updateOne, createOne, getOne, getAll } = require('./handlerFactory')

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  const tour = await Tour.findById(req.params.id)
  // create checkout session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    success_url:
      `${req.protocol}://${req.get('host')}/?tour=${req.params.id}&user=${req.user.id}&price=${tour.price}`,
    cancel_url: `${req.protocol}://${req.get('host')}/tours/${tour.slug}`,
    customer_email: req.user.email,
    client_reference_id: req.params.id,
    line_items: [{
      name: `${tour.name} Tour`,
      description: tour.summary,
      images: [`https://www.natours.dev/img/tours/${tour.imageCover}`],
      amount: tour.price * 100,
      currency: 'aud',
      quantity: 1

    }]


  })
  res.status(200).json({
    status: 'success',
    session
  })

})

exports.createBookingCheckout = catchAsync(async (req, res, next) => {
  const { tour, user, price } = req.query
  if (!tour || !user || !price) return next()
  await Booking.create({ tour, user, price })

  res.redirect(req.originalUrl.split('?')[0])
  next()
})
exports.setRequiredData = async (req, res, next) => {
  if (!req.body.tour) req.body.tour = req.params.tourId
  const tour = await Tour.findById(req.body.tour)
  if (!tour) return next(new AppError('this tour does not exist', 400))
  if (!req.body.user) req.body.user = req.user.id
  if (!req.body.price) req.body.price = tour.price
  next()
}
exports.createBooking = createOne(Booking)
exports.getAllBookings = getAll(Booking)
exports.findOneBooking = getOne(Booking)
exports.deleteBooking = deleteOne(Booking)
exports.updateBooking = updateOne(Booking)