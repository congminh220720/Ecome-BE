'use strict'

const { CREATED, SuccessResponse } = require("../core/success.response")
const ProductFactory = require('../services/product.service')

class ProductController {
    createProduct = async (req,res) => {
        new CREATED({
            metadata: await ProductFactory.createProduct(req.user._id, req.body.type, req.body),
            message: 'Create product success !'
        }).send(res)
    }

    updateProduct = async (req,res) => {
        new SuccessResponse({
            metadata: await ProductFactory.updateProduct(req.body.type,req.query.productId,req.user._id, req.body),
            message: 'Update product success !'
        }).send(res)
    }

    publishProductByShop = async (req,res) => {
        new SuccessResponse({
            metadata: await ProductFactory.publishProductByShop(req.query.shopId,req.query.productId),
            message: 'Update product success !'
        }).send(res)
    }

    unPublishProductByShop = async (req,res) => {
        new SuccessResponse({
            metadata: await ProductFactory.unPublishProductByShop(req.query.shopId,req.query.productId),
            message: 'Update product success !'
        }).send(res)
    }

    findAllDraftsForShop = async (req,res) => {
        new SuccessResponse({
            metadata: await ProductFactory.findAllDraftsForShop({shopId:req.query.shopId}),
            message: 'get product success !'
        }).send(res)
    }

    findAllPublishForShop = async (req,res) => {
        new SuccessResponse({
            metadata: await ProductFactory.findAllPublishForShop({shopId:req.query.shopId}),
            message: 'get product success !'
        }).send(res)
    }

    searchProducts = async (req,res) => {
        new SuccessResponse({
            metadata: await ProductFactory.searchProducts({keySearch: req.query.keySearch}),
            message: 'Success !'
        }).send(res)
    }

    findAllProducts = async (req,res) => {
        new SuccessResponse({
            metadata: await ProductFactory.findAllProducts({limit: req.query.limit, page: req.query.page,}),
            message: 'Success !'
        }).send(res)
    }

    findProduct = async (req,res) => {
        new SuccessResponse({
            metadata: await ProductFactory.findProduct({productId: req.query.productId}),
            message: 'get product success !'
        }).send(res)
    }
}


module.exports = new ProductController()