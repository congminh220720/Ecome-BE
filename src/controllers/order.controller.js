'use strict'
const { CREATED ,SuccessResponse } = require("../core/success.response")
const OrderService = require('../services/order.service')

class OrderController {
    createOrder = async (req, res, next) => {
        new CREATED({
            message: 'Created order success !',
            metadata: await OrderService.createOrder(req.user._id,req.body)
        }).send(res)
    }   

    paymentOrder = async (req, res, next) => {
        new SuccessResponse({
            message: 'Update success',
            metadata: await OrderService.paymentOrder(req.user._id,req.body)
        }).send(res)
    }

    listOrderByStatus = async (req, res, next) => {
        new SuccessResponse({
            message: 'Update success',
            metadata: await OrderService.listOrderByStatus(req.user._id,req.query.status)
        }).send(res)
    }   


    listMyOrder = async (req, res, next) => {
        new SuccessResponse({
            message: 'Update success',
            metadata: await OrderService.listMyOrder(req.user._id)
        }).send(res)
    }   

    cancelOrder = async (req, res, next) => {
        new SuccessResponse({
            message: 'Update success',
            metadata: await OrderService.cancelOrder(req.user._id,req.query.orderGroupId)
        }).send(res)
    }   

    returnOrder = async (req, res, next) => {
        new SuccessResponse({
            message: 'Update success',
            metadata: await OrderService.returnOrder(req.user._id,req.body)
        }).send(res)
    } 
    
    verifyOrder = async (req, res, next) => {
        new SuccessResponse({
            message: 'Update success',
            metadata: await OrderService.verifyOrder(req.user._id,req.query.orderId)
        }).send(res)
    }   

    cancelOrderByAdmin = async (req, res, next) => {
        new SuccessResponse({
            message: 'Update success',
            metadata: await OrderService.cancelOrderByAdmin(req.user._id,req.query.orderId)
        }).send(res)
    }   

    approveReturnOrder = async (req, res, next) => {
        new SuccessResponse({
            message: 'Update success',
            metadata: await OrderService.approveReturnOrder(req.user._id,req.query.orderId)
        }).send(res)
    }   

    listOrderByShop = async (req, res, next) => {
        new SuccessResponse({
            message: 'Update success',
            metadata: await OrderService.listOrderByShop(req.user._id,req.query.shopId)
        }).send(res)
    }   

    listOrderStatusByShop = async (req, res, next) => {
        new SuccessResponse({
            message: 'Update success',
            metadata: await OrderService.listOrderStatusByShop(req.user._id,req.query.shopId, req.query.status)
        }).send(res)
    }   
}

module.exports = new OrderController()