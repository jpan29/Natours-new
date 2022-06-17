
const AppError = require('../utils/appError')
const handleJwtError = err => new AppError('invalid token, please login again', 401)
const handleJwtExipiredError = err => new AppError('your token has expired', 401)
const handleCastError = err => {
  const message = `Invalid ${err.path}:${err.value}`
  return new AppError(message, 400)
}

const handleValidationError = err => {

  return new AppError(err.message, 400)
}
const handleDuplicateError = err => {
  const message = `Duplicated tour name: ${err.keyValue.name}`
  return new AppError(message, 400)
}

const sendErrorDev = (err, req, res) => {

  if (req.originalUrl.startsWith('/api')) {
    res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack

    })
  } else {

    res.status(err.statusCode).render('error', {
      title: 'Something went wrong',
      msg: err.message

    })
  }
}
const sendErrorPro = (err, req, res) => {
  // For API 
  if (req.originalUrl.startsWith('/api')) {
    // Operational error :send message to the client
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message
      })
    }
    // Programming or unknown error:don't send to the client
    return res.status(500).json({
      status: 'error',
      message: 'Sorry something went wrong 🥲'
    })

  }


  // For render to client
  if (err.isOperational) {

    return res.status(err.statusCode).render('error', {
      title: 'Something went wrong',
      msg: err.message
    })
  }

  return res.status(500).render('error', {
    title: 'Something went wrong',
    msg: 'Sorry something went wrong 🥲'
  })

}




module.exports = (err, req, res, next) => {

  err.statusCode = err.statusCode || 500
  err.status = err.status || 'error'
  let error = { ...err }
  error.message = err.message
  if (process.env.NODE_ENV === 'development') sendErrorDev(error, req, res)

  if (process.env.NODE_ENV === 'production') {

    if (error.name === 'CastError') error = handleCastError(error)
    if (error.name === 'ValidationError') error = handleValidationError(error)
    if (error.code === 11000) error = handleDuplicateError(error)
    if (error.name === 'JsonWebTokenError') error = handleJwtError(error)
    if (error.name === 'TokenExpiredError') error = handleJwtExipiredError(error)


    sendErrorPro(err, req, res)
  }


}



