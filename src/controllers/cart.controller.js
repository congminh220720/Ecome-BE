'use strict'
const { CREATED ,SuccessResponse } = require("../core/success.response")
const CartService = require('../services/cart.service')

class CartController {
    createCart = async (req, res, next) => {
        new CREATED({
            message: 'Create cart success !',
            metadata: await CartService.createCart(req.user._id,req.body)
        }).send(res)
    }   

    cleanCart = async (req, res, next) => {
        new SuccessResponse({
            message: 'success',
            metadata: await CartService.cleanCart(req.user._id)
        }).send(res)
    }   

    addProductToCard = async (req, res, next) => {
        new SuccessResponse({
            message: 'Update Success!',
            metadata: await CartService.addProductToCard(req.user._id,req.body)
        }).send(res)
    }  
    
    removeProductInCard = async (req, res, next) => {
        new SuccessResponse({
            message: 'Success!',
            metadata: await CartService.removeProductInCard(req.user._id, req.query.productId)
        }).send(res)
    }  

    subtractQuantityProduct = async (req, res, next) => {
        new SuccessResponse({
            message: 'Success!',
            metadata: await CartService.subtractQuantityProduct(req.user._id, req.body)
        }).send(res)
    }  

    getCart = async (req, res, next) => {
        new SuccessResponse({
            message: 'Success!',
            metadata: await CartService.getCart(req.user._id)
        }).send(res)
    }  
}

module.exports = new CartController()