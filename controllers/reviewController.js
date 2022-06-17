
const Review = require('../models/reviewModel')
const Tour = require('../models/tourModel')
const AppError = require('../utils/appError')


const { deleteOne, updateOne, createOne, getOne, getAll } = require('./handlerFactory')

exports.getAllReviews = getAll(Review)
exports.setTourUserIds = async (req, res, next) => {
  if (!req.body.tour) req.body.tour = req.params.tourId
  const tour = await Tour.findById(req.body.tour)
  if (!tour) return next(new AppError('this tour does not exist', 400))
  if (!req.body.user) req.body.user = req.user.id
  next()
}
exports.createReview = createOne(Review)
exports.deleteReview = deleteOne(Review)
exports.updateReview = updateOne(Review)
exports.getReview = getOne(Review)