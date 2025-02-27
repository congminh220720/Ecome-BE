'use strict'

const express = require('express')
const { apiKey, permission } = require('../auth/checkAuth')
const router = express.Router()

router.use(apiKey)
router.use(permission('0000'))

router.use('/v1/api/user', require('./user'))
router.use('/v1/api/shop', require('./shop'))
router.use('/v1/api/product', require('./product'))
router.use('/v1/api/inventory', require('./inventory'))

module.exports = router
