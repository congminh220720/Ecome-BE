'use strict'

const express = require('express')
const router = express.Router()
const UserController = require('../../controllers/user.controller')
const { asyncHandler } = require('../../helpers/asyncHandler')
const { authenticationV2 } = require('../../auth/authUtils')


router.post('/signin', asyncHandler(UserController.signin))

router.post('/login', asyncHandler(UserController.login))

router.use(authenticationV2)

router.get('/getUser', asyncHandler(UserController.getUser))
router.post('/logout', asyncHandler(UserController.logout))
router.post('/refreshToken', asyncHandler(UserController.refreshToken))
router.patch('/update', asyncHandler(UserController.updateUser))
router.patch('/changePassword', asyncHandler(UserController.changePassword))


module.exports = router