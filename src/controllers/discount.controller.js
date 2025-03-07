'use strict'
const { CREATED ,SuccessResponse } = require("../core/success.response")
const DiscountService = require('../services/discount.service')

class DiscountController {
    createDiscount = async (req, res, next) => {
        new CREATED({
            message: 'Created success !',
            metadata: await DiscountService.createDiscount(req.user._id,req.body)
        }).send(res)
    }   

    updateDiscount = async (req, res, next) => {
        new SuccessResponse({
            message: 'Update success',
            metadata: await DiscountService.updateDiscount(req.user._id, req.query.shopId, req.query.id,req.body)
        }).send(res)
    }   

    activeDiscount = async (req, res, next) => {
        new SuccessResponse({
            message: 'Update Success!',
            metadata: await DiscountService.activeDiscount(req.user._id,req.body)
        }).send(res)
    }  
    
    inactiveDiscount = async (req, res, next) => {
        new SuccessResponse({
            message: 'Update Success!',
            metadata: await DiscountService.inactiveDiscount(req.user._id,req.body)
        }).send(res)
    }
    
    listDiscountByProductId = async (req, res, next) => {
        new SuccessResponse({
            message: 'OK!',
            metadata: await DiscountService.listDiscountByProductId(req.query.productId)
        }).send(res)
    }

    listDiscountByShopId = async (req, res, next) => {
        new SuccessResponse({
            message: 'OK!',
            metadata: await DiscountService.listDiscountByShopId(req.query.shopId)
        }).send(res)
    }

    getDiscountDetailByCode = async (req, res, next) => {
        new SuccessResponse({
            message: 'OK!',
            metadata: await DiscountService.getDiscountDetailByCode(req.query.code,req.query.shopId)
        }).send(res)
    }

    applyDiscount = async (req, res, next) => {
        new SuccessResponse({
            message: 'OK!',
            metadata: await DiscountService.applyDiscount(req.user._id,req.body)
        }).send(res)
    }
}

module.exports = new DiscountController()