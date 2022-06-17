const express = require('express')
const path = require('path')
const morgan = require('morgan')
const rateLimit = require('express-rate-limit')
const helmet = require('helmet')
const mongoSanitize = require('express-mongo-sanitize')
const xssClean = require('xss-clean')
const hpp = require('hpp')
const cors = require('cors')

const AppError = require('./utils/appError')
const errorController = require('./controllers/errorController')


const tourRoute = require('./routes/tourRoutes')
const userRoute = require('./routes/userRoutes')
const reviewRoute = require('./routes/reviewRoutes')
const viewRoute = require('./routes/viewRoutes')
const bookingRoute = require('./routes/bookingRoutes')
const cookieParser = require('cookie-parser')

const app = express()
// middleware
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'))
// set template engine and location of views folder
app.set('view engine', 'pug')
app.set('views', path.join(__dirname, 'views'))



// secure http headers

// app.use(helmet())

// app.use(
//   helmet.contentSecurityPolicy({
//     useDefaults: true,
//     directives: {
//       "script-src": ["'self'", "*"]

//     }
//   })
// )

// app.use(
//   helmet({
//     contentSecurityPolicy: false,
//   })
// )
// app.use(
//   helmet.contentSecurityPolicy({
//     useDefaults: true,
//     directives: {
//       'script-src': ["'self'", "unpkg.com"]

//     },
//   })
// )
// 100 request from same ip in 1hour
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'too many request from this ip'
})
app.use('/api', limiter)

app.use(express.json())
app.use(cookieParser())

// prevent parameter pollution
app.use(hpp({
  whitelist:
    ['duration',
      'ratingsAverage',
      'ratingsQuantity',
      'maxGroupSize',
      'difficulty',
      'price']
}))


// data sanitization against nosql query injection

app.use(mongoSanitize())
app.use(xssClean())


app.use(express.static(`${__dirname}/public`))

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString()
  next()
})


// routes
app.use('/', viewRoute)
app.use('/api/v1/tours', tourRoute)
app.use('/api/v1/users', userRoute)
app.use('/api/v1/reviews', reviewRoute)
app.use('/api/v1/booking', bookingRoute)

app.all('*', (req, res, next) => {
  // res.status(404).json({
  //   status: 'fail',
  //   message: `Can not find ${req.originalUrl} on this server`
  // })

  next(new AppError(`Can not find ${req.originalUrl} on this server`, 404))


})
app.use(errorController)


module.exports = app