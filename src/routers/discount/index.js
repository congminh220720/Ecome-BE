'use strict'

const express = require('express')
const router = express.Router()
const DiscountController = require('../../controllers/discount.controller')
const { asyncHandler } = require('../../helpers/asyncHandler')
const { authenticationV2 } = require('../../auth/authUtils')

router.use(authenticationV2)

router.post('/create', asyncHandler(DiscountController.createDiscount))
router.patch('/update', asyncHandler(DiscountController.updateDiscount))
router.patch('/active', asyncHandler(DiscountController.activeDiscount))
router.patch('/inactive', asyncHandler(DiscountController.inactiveDiscount))

router.get('/listDiscountByProductId', asyncHandler(DiscountController.listDiscountByProductId))
router.get('/listDiscountByShopId', asyncHandler(DiscountController.listDiscountByShopId))
router.get('/getCodeDetail', asyncHandler(DiscountController.getDiscountDetailByCode))
router.post('/applyDiscount', asyncHandler(DiscountController.applyDiscount))

module.exports = router