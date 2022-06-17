const express = require('express')
const { getAllReviews, createReview, deleteReview, updateReview, setTourUserIds, getReview } = require('../controllers/reviewController')
const { protect, restrictTo } = require('../controllers/authController')
const router = express.Router({
  mergeParams: true
})

router.get('/', getAllReviews)
router.use(protect)
router
  .route('/')
  .post(restrictTo('user'), setTourUserIds, createReview)
router
  .route('/:id')
  .delete(restrictTo('user'), deleteReview)
  .patch(restrictTo('user'), updateReview)
  .get(getReview)


module.exports = router

