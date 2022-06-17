
const Tour = require('../models/tourModel')
const Booking = require('../models/bookingModel')
const AppError = require('../utils/appError')
const catchAsync = require('../utils/catchAsync')

exports.getOverview = catchAsync(async (req, res, next) => {

  const tours = await Tour.find()

  res.status(200).render('overview',
    {
      title: 'All tours',
      tours
    })
})
exports.getTour = catchAsync(async (req, res, next) => {

  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'review rating user'
  })

  if (!tour) return next(new AppError('No tour found', 404))
  res.status(200).render('tour',
    {
      title: tour.name,
      tour

    })
})
exports.login = catchAsync(async (req, res, next) => {


  res.status(200).render('login', {
    title: 'Login in to your account'
  })
})
exports.signup = catchAsync(async (req, res, next) => {


  res.status(200).render('signup', {
    title: 'Sign up a new account'
  })
})
exports.getAccount = catchAsync(async (req, res, next) => {

  res.status(200).render('account', {
    title: 'Your account'
  })
})
exports.getMyTour = catchAsync(async (req, res, next) => {
  const bookings = await Booking.find({ user: req.user.id })
  const tourIds = bookings.map(booking => booking.tour.id)
  // const tours = await Promise.all(tourIds.map(async id => await Tour.findById(id)))
  const tours = await Tour.find({ _id: { $in: tourIds } })
  console.log(tours)
  res.status(200).render('overview', {
    title: 'My booking list',
    tours
  })
})
