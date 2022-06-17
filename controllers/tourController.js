const multer = require('multer')
const sharp = require('sharp')
const Tour = require('../models/tourModel')
const AppError = require('../utils/appError')
const catchAsync = require('../utils/catchAsync')
const { deleteOne, updateOne, createOne, getOne, getAll } = require('./handlerFactory')

const multerStorage = multer.memoryStorage()

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image'))
    return cb(null, true)

  return cb(new AppError('Please upload only image', 400), false)
}

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter
})

exports.uploadPhoto = upload.fields([
  { name: 'imageCover', maxCount: 1 },
  { name: 'images', maxCount: 3 }
])
exports.resizePhoto = catchAsync(async (req, res, next) => {

  if (!req.files) return next()
  // Cover image
  req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`

  await sharp(req.files.imageCover[0].buffer)
    .resize(2000, 1333)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/tours/${req.body.imageCover}`)



  // images
  req.body.images = []
  const filePromises = req.files.images.map(async (file, i) => {
    const filename = `tour-${req.params.id}-${Date.now()}-${i + 1}.jpeg`
    await sharp(file.buffer)
      .resize(2000, 1333)
      .toFormat('jpeg')
      .jpeg({ quality: 90 })
      .toFile(`public/img/tours/${filename}`)
    req.body.images.push(filename)
  })
  await Promise.all(filePromises)

  next()
})
exports.aliasTopTours = (req, res, next) => {
  req.query.limit = 5
  req.query.sort = '-ratingsAverage price'
  req.query.fields = 'name price ratingsAverage summary difficulty'
  next()

}



// router handler

exports.getAllTours = getAll(Tour)

exports.findOneTour = getOne(Tour, { path: 'reviews' })
exports.createNewTour = createOne(Tour)
exports.updateTour = updateOne(Tour)
exports.deleteTour = deleteOne(Tour)
// aggregation pipeline
exports.getTourStats = catchAsync(async (req, res, next) => {

  const stats = await Tour.aggregate([
    {
      $match:
        { ratingsAverage: { $gte: 4.5 } }
    },
    {
      $group: {
        _id: { $toUpper: '$difficulty' },
        numTours: { $sum: 1 },
        numRatings: { $sum: '$ratingsQuantity' },
        avgrating: { $avg: '$ratingsAverage' },
        avgprice: { $avg: '$price' },
        minprice: { $min: '$price' },
        maxprice: { $max: '$price' }
      }
    },
    {
      $sort: {
        // 1 for asc order,-1 for desc order
        avgprice: 1
      }
    }
    // {
    //   $match: {
    //     _id: { $ne: 'EASY' }
    //   }
    // }

  ])
  res.status(200).json({
    status: 'success',
    data: {
      stats
    }
  })

})
exports.getMonthlyPlan = catchAsync(async (req, res, next) => {

  const year = +req.params.year

  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates'
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`)
        }
      }
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numTours: { $sum: 1 },
        tours: { $push: '$name' }
      }
    },
    {
      $addFields: { month: '$_id' }
    },
    {
      $project: {
        _id: 0
      }
    },
    {
      $sort: { numTours: -1 }

    },
    {
      $limit: 12
    }

  ])
  res.status(200).json({
    status: 'success',
    data: {
      plan
    }
  })


})
// /tours-within/:distance/certer/116.334129,39.965166/unit/:unit
exports.getToursWithin = async (req, res, next) => {
  const { distance, lnglat, unit } = req.params

  const [lng, lat] = lnglat.split(',')
  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1
  if (!lng || !lat)
    return next(new AppError('please provide in the format lng, lat', 400))
  console.log(distance, lng, lat, unit)
  const tours = await Tour.find({
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } }
  })
  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      data: tours
    }
  })
}

exports.getDistances = async (req, res, next) => {
  const { lnglat, unit } = req.params

  const [lng, lat] = lnglat.split(',')
  const multiplier = unit === 'mi' ? 0.000621371 : 0.001

  if (!lng || !lat)
    return next(new AppError('please provide in the format lng, lat', 400))
  const distances = await Tour.aggregate([
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [+lng, +lat]

        },
        distanceField: 'distance',
        distanceMultiplier: multiplier
      }
    },
    {
      $project: {
        distance: 1,
        name: 1
      }
    }
  ])

  res.status(200).json({
    status: 'success',

    data: {
      data: distances
    }
  })

}