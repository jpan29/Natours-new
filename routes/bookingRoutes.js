const express = require('express')
const { protect, restrictTo } = require('../controllers/authController')
const {
  getCheckoutSession,
  createBooking,
  getAllBookings,
  findOneBooking,
  updateBooking,
  deleteBooking,
  setRequiredData } = require('../controllers/bookingController')

const router = express.Router({
  mergeParams: true
})

router.use(protect)
router.get('/checkout-session/:id', getCheckoutSession)
router.use(restrictTo('admin', 'lead-guide'))
router.route('/')
  .post(setRequiredData, createBooking)
  .get(getAllBookings)


router.route('/:id')
  .get(findOneBooking)
  .patch(updateBooking)
  .delete(deleteBooking)

module.exports = router