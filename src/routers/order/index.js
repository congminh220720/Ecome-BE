'use strict'

const express = require('express')
const router = express.Router()
const OrderController = require('../../controllers/order.controller')
const { asyncHandler } = require('../../helpers/asyncHandler')
const { authenticationV2 } = require('../../auth/authUtils')

router.use(authenticationV2)

router.post('/create', asyncHandler(OrderController.createOrder))
router.post('/payment', asyncHandler(OrderController.paymentOrder))
router.get('/listOrderByStatus', asyncHandler(OrderController.listOrderByStatus))
router.get('/listMyOrder', asyncHandler(OrderController.listMyOrder))
router.post('/cancelOrder', asyncHandler(OrderController.cancelOrder))
router.post('/returnOrder', asyncHandler(OrderController.returnOrder))
router.post('/verifyOrder', asyncHandler(OrderController.verifyOrder))
router.post('/cancelOrderByAdmin', asyncHandler(OrderController.cancelOrderByAdmin))
router.post('/approveReturnOrder', asyncHandler(OrderController.approveReturnOrder))
router.get('/listOrderByShop', asyncHandler(OrderController.listOrderByShop))
router.get('/listOrderStatusByShop', asyncHandler(OrderController.listOrderStatusByShop))

module.exports = router