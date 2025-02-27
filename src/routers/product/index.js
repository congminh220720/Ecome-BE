'use strict'

const express = require('express')
const router = express.Router()
const ProductController = require('../../controllers/product.controller')
const { asyncHandler } = require('../../helpers/asyncHandler')
const { authenticationV2 } = require('../../auth/authUtils')


router.use(authenticationV2)

router.post('/create', asyncHandler(ProductController.createProduct))
router.patch('/update', asyncHandler(ProductController.updateProduct))
router.patch('/publicProduct', asyncHandler(ProductController.publishProductByShop))
router.patch('/unPublicProduct', asyncHandler(ProductController.unPublishProductByShop))
router.get('/listDraftProduct', asyncHandler(ProductController.findAllDraftsForShop))
router.get('/listPublicProduct', asyncHandler(ProductController.findAllPublishForShop))
router.get('/search', asyncHandler(ProductController.searchProducts))
router.get('/listAllProduct', asyncHandler(ProductController.findAllProducts))
router.get('/getDetail', asyncHandler(ProductController.findProduct))

module.exports = router