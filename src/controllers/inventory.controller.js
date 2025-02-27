'use strict'
const { SuccessResponse } = require("../core/success.response")
const InventoryService = require('../services/inventory.service')

class InventoryController {
    addStockByAdmin = async (req, res, next) => {
        new SuccessResponse({
            message: 'Update success !',
            metadata: await InventoryService.addStockByAdmin(req.user._id,req.body)
        }).send(res)
    }   

    subtractStockByAdmin = async (req, res, next) => {
        new SuccessResponse({
            message: 'Update success',
            metadata: await InventoryService.subtractStockByAdmin(req.user._id,req.body)
        }).send(res)
    }   

    updateInventory = async (req, res, next) => {
        new SuccessResponse({
            message: 'Update Success!',
            metadata: await InventoryService.updateInventory(req.user._id,req.query.productId,req.body)
        }).send(res)
    }  
    
    getListInventoryByShop = async (req, res, next) => {
        new SuccessResponse({
            message: 'OK!',
            metadata: await InventoryService.getListInventoryByShop(req.query.shopId)
        }).send(res)
    }  
}

module.exports = new InventoryController()