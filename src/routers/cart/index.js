'use strict'

const express = require('express')
const router = express.Router()
const CartController = require('../../controllers/cart.controller')
const { asyncHandler } = require('../../helpers/asyncHandler')
const { authenticationV2 } = require('../../auth/authUtils')

router.use(authenticationV2)

router.post('/create', asyncHandler(CartController.createCart))
router.patch('/clean', asyncHandler(CartController.cleanCart))
router.post('/addProduct', asyncHandler(CartController.addProductToCard))
router.delete('/removeProduct', asyncHandler(CartController.removeProductInCard))
router.patch('/subtractQuantity', asyncHandler(CartController.subtractQuantityProduct))
router.get('/getCart', asyncHandler(CartController.getCart))

module.exports = router