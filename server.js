const mongoose = require('mongoose')
const dotenv = require('dotenv')
process.on('uncaughtException', err => {
  console.log(err.name, err.message)
  console.log('Uncaught Exception💥')
  process.exit(1)

})
dotenv.config({ path: './config.env' })
const app = require('./app')


const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD)
mongoose.connect(DB, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false
}).then(con =>
  console.log('DB connection successful')
)



console.log(process.env.NODE_ENV)


// start server
const port = process.env.PORT || 3000

const server = app.listen(port, () => console.log(`running on port ${port}`))

process.on('unhandledRejection', err => {
  console.log(err.name, err.message)
  console.log('Unhandled Rejection💥')
  server.close(() => process.exit(1))

})

