'use strict'

const express = require('express')
const router = express.Router()
const ShopController = require('../../controllers/shop.controller')
const { asyncHandler } = require('../../helpers/asyncHandler')
const { authenticationV2 } = require('../../auth/authUtils')


router.use(authenticationV2)

router.post('/register', asyncHandler(ShopController.registerShop))
router.post('/update', asyncHandler(ShopController.updateShop))
router.get('/getShops', asyncHandler(ShopController.getShops))
router.get('/getShopDetail', asyncHandler(ShopController.getShopDetail))
router.get('/search', asyncHandler(ShopController.searchShop))
router.post('/addStaff', asyncHandler(ShopController.addStaff))
router.get('/getStaffs', asyncHandler(ShopController.getStaff))
router.post('/follow', asyncHandler(ShopController.followShop))
router.post('/unFollow', asyncHandler(ShopController.unFollowShop))
router.patch('/updateStaff', asyncHandler(ShopController.updateStaff))

module.exports = router