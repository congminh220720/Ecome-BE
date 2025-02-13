'use strict' 

const express = require('express')
const morgan = require('morgan')
const swaggerUI = require('swagger-ui-express')
const swaggerJsDoc = require('swagger-jsdoc')
const compression = require('compression')
const helmet = require('helmet')
const dotenv = require('dotenv')

const swaggerOptions = require('../src/config/config.swagger')

dotenv.config()
const swaggerDocs = swaggerJsDoc(swaggerOptions);
const app = express()

app.use(morgan('dev'))
app.use(helmet())
app.use(compression())
app.use(express.json())
app.use(express.urlencoded({extended: true}))


require('./db/init.mongodb')

app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerDocs));


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