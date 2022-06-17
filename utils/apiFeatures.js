class APIFeatures {
  constructor(query, queryString) {
    this.query = query
    this.queryString = queryString

  }
  filter () {

    const queryObj = { ...this.queryString }
    const excludes = ['page', 'sort', 'limit', 'fields']
    excludes.forEach(el => delete queryObj[el])

    let queryString = JSON.stringify(queryObj)
    queryString = queryString.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`)
    this.query = this.query.find(JSON.parse(queryString))
    return this

  }
  sort () {
    if (this.queryString.sort) {

      const sortFields = this.queryString.sort.split(',').join(' ')
      this.query = this.query.sort(sortFields)
      // sort('price ratingsAverage')
    } else this.query = this.query.sort('-createAt')
    return this
  }
  limit () {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ')

      this.query = this.query.select(fields)
    } else this.query = this.query.select('-__v')
    return this
  }
  paginate () {
    const page = + this.queryString.page || 1
    const limit = + this.queryString.limit || 100
    const skip = (page - 1) * limit


    // if (this.queryString.page) {
    //   const numTours = await this.query.countDocuments()
    //   if (skip >= numTours) throw new Error('no more tours found')
    // }
    this.query = this.query.skip(skip).limit(limit)
    return this
  }
}
module.exports = APIFeatures