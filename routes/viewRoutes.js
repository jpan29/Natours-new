const express = require('express')
const { isLoggedIn, protect } = require('../controllers/authController')
const { getOverview, getTour, login, signup, getAccount, getMyTour } = require('../controllers/viewsController')
const { createBookingCheckout } = require('../controllers/bookingController')
const router = express.Router()


router.get('/me', protect, getAccount)

router.use(isLoggedIn)
router.route('/login').get(login)
router.get('/signup', signup)
router.route('/').get(createBookingCheckout, getOverview)
router.get('/tours/:slug', getTour)
router.get('/my-tours', protect, getMyTour)


module.exports = router