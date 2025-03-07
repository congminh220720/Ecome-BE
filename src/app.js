'use strict' 

const express = require('express')
const morgan = require('morgan')
const compression = require('compression')
const helmet = require('helmet')
const dotenv = require('dotenv')


dotenv.config()
const app = express()

app.use(morgan('dev'))
app.use(helmet())
app.use(compression())
app.use(express.json())
app.use(express.urlencoded({extended: true}))


require('./db/init.mongodb')
require('./db/init.redis')

// init routes
app.use('/', require('./routers/index'))
// handling error

app.use((req,res,next) => {
    const error = new Error('Not Found')
    error.status = 404
    next(error)
})

app.use((error,req,res,next) => {
   const statusCode = error.status || 500
   console.log(error)
   return res.status(statusCode).json({
        status: 'Error',
        code: statusCode,
        message: error.message || 'Internal server error'
   })
})



module.exports = app