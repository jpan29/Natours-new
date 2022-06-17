const express = require('express')

const {
  getAllUsers,
  findOneUser,
  deleteUser,
  updateUser,
  updateMe,
  deleteMe,
  getMe,
  uploadPhoto,
  resizePhoto } = require('../controllers/userController')
const {
  protect,
  signup,
  login,
  forgotPassword,
  resetPassword,
  updatePassword,
  restrictTo,
  logout } = require('../controllers/authController')



// routes
// public user
const router = express.Router()
router.post('/signup', signup)
router.post('/login', login)
router.get('/logout', logout)
router.post('/forgotPassword', forgotPassword)
router.patch('/resetPassword/:token', resetPassword)
// need to login 
router.use(protect)
router.patch('/updatePassword', updatePassword)
router.patch('/updateMe', uploadPhoto, resizePhoto, updateMe)
router.delete('/deleteMe', deleteMe)
router.get('/me', getMe, findOneUser)

//admin
router.use(restrictTo('admin'))
router
  .route('/')
  .get(getAllUsers)

router
  .route('/:id')
  .get(findOneUser)
  .delete(deleteUser)
  .patch(updateUser)


module.exports = router