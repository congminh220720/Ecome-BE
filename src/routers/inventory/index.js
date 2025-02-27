'use strict'

const express = require('express')
const router = express.Router()
const InventoryController = require('../../controllers/inventory.controller')
const { asyncHandler } = require('../../helpers/asyncHandler')
const { authenticationV2 } = require('../../auth/authUtils')

router.use(authenticationV2)

router.patch('/addStock', asyncHandler(InventoryController.addStockByAdmin))
router.patch('/subtractStock', asyncHandler(InventoryController.subtractStockByAdmin))
router.patch('/updateInventory', asyncHandler(InventoryController.updateInventory))
router.get('/getListInventory', asyncHandler(InventoryController.getListInventoryByShop))

module.exports = router