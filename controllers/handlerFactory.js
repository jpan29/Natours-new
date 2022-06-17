const catchAsync = require('../utils/catchAsync')
const AppError = require('../utils/appError')
const APIFeatures = require('../utils/apiFeatures')
exports.deleteOne = Model => catchAsync(async (req, res, next) => {
  const doc = await Model.findByIdAndDelete(req.params.id)
  if (!doc) return next(new AppError('no doc found', 404))

  res.status(204).json({
    status: 'success',
    data: null

  })

})

exports.updateOne = Model => catchAsync(async (req, res, next) => {

  const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  })

  if (!doc) return next(new AppError('no doc found', 404))

  res.status(200).json({
    status: 'success',
    data: {
      doc
    }
  })
})


exports.createOne = Model => catchAsync(async (req, res, next) => {

  const doc = await Model.create(req.body)

  res.status(201).json({
    status: 'success',
    data: {
      doc
    }
  })

})
exports.getOne = (Model, populations) => catchAsync(async (req, res, next) => {
  let query = Model.findById(req.params.id)
  populations ? query = query.populate(populations) : query
  const doc = await query
  // doc.findOne({_id:req.params.id})

  if (!doc) return next(new AppError('no doc found', 404))

  res.status(200).json({
    status: 'success',
    data: {
      doc
    }
  })

})

exports.getAll = Model => catchAsync(async (req, res, next) => {
  // allow get review on a tour
  let filter
  if (req.params.tourId) filter = { tour: req.params.tourId }

  const features = new APIFeatures(Model.find(filter), req.query)
    .filter()
    .sort()
    .limit()
    .paginate()

  const docs = await features.query

  res.status(200).json({
    status: 'success',
    results: docs.length,
    data: {
      data: docs
    }
  })

}

)


