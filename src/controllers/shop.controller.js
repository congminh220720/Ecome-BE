'use strict'
const { CREATED, SuccessResponse } = require("../core/success.response")
const ShopService = require('../services/shop.service')

class ShopController {
    registerShop = async (req, res, next) => {
        new CREATED({
            message: 'Registered OK !',
            metadata: await ShopService.registerShop(req.user._id,req.body)
        }).send(res)
    }   

    updateShop = async (req, res, next) => {
        new SuccessResponse({
            message: 'Update success',
            metadata: await ShopService.updateShop(req.query.shopId,req.user._id,req.body)
        }).send(res)
    }   

    getShops = async (req, res, next) => {
        new SuccessResponse({
            message: 'success',
            metadata: await ShopService.getShops(req.query)
        }).send(res)
    }   

    getShopDetail = async (req, res, next) => {
        new SuccessResponse({
            message: 'success',
            metadata: await ShopService.getShopDetail(req.query.shopId)
        }).send(res)
    } 
    
    searchShop = async (req, res, next) => {
        new SuccessResponse({
            message: 'success',
            metadata: await ShopService.searchShop(req.query.search)
        }).send(res)
    } 

    addStaff = async (req, res, next) => {
        new SuccessResponse({
            message: 'success',
            metadata: await ShopService.addStaff(req.user._id,req.query.shopId, req.body)
        }).send(res)
    } 

    updateStaff = async (req, res, next) => {
        new SuccessResponse({
            message: 'success',
            metadata: await ShopService.updateStaff(req.user._id,req.query.shopId, req.body)
        }).send(res)
    } 

    getStaff = async (req, res, next) => {
        new SuccessResponse({
            message: 'success',
            metadata: await ShopService.getStaff(req.query.shopId)
        }).send(res)
    } 

    followShop = async (req, res, next) => {
        new SuccessResponse({
            message: 'success',
            metadata: await ShopService.followShop(req.user._id,req.body)
        }).send(res)
    } 

    unFollowShop = async (req, res, next) => {
        new SuccessResponse({
            message: 'success',
            metadata: await ShopService.unFollowShop(req.user._id,req.body)
        }).send(res)
    } 

}

module.exports = new ShopController()