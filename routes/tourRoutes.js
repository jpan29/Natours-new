const express = require('express')
const {
  getAllTours,
  createNewTour,
  findOneTour,
  updateTour,
  deleteTour,
  aliasTopTours,
  getTourStats,
  getMonthlyPlan,
  getToursWithin,
  getDistances,
  uploadPhoto,
  resizePhoto
} = require('../controllers/tourController')
const { protect, restrictTo } = require('../controllers/authController')
const reviewRouter = require('./reviewRoutes')
const bookingRouter = require('./bookingRoutes')

// routes
const router = express.Router()
router.use('/:tourId/reviews', reviewRouter)
router.use('/:tourId/booking', bookingRouter)
router.route('/tours-within/:distance/certer/:lnglat/unit/:unit').get(getToursWithin)
router.route('/distances/:lnglat/unit/:unit').get(getDistances)
// router.param('id', checkId)
router.route('/top-5-cheaptours').get(aliasTopTours, getAllTours)
router.route('/tours-stats').get(getTourStats)
router.route('/monthly-plan/:year').get(protect, restrictTo('admin', 'lead-guide', 'guide'), getMonthlyPlan)
router
  .route('/')
  .get(getAllTours)
  .post(protect, restrictTo('admin', 'lead-guide'), createNewTour)
router
  .route('/:id')
  .get(findOneTour)
  .patch(protect, restrictTo('admin', 'lead-guide'), uploadPhoto, resizePhoto, updateTour)
  .delete(protect, restrictTo('admin', 'lead-guide'), deleteTour)

// router.route('/:tourId/reviews').post(protect, restrictTo('user'), createReview)
module.exports = router