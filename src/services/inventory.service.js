'use strict'
const { BadRequestError } = require('../core/error.response')
const {inventoryDB} = require('../models/inventory.model')
const { getInventoryByProductId, updateInventory, getListInventoryByShop} = require('../models/repositories/inventory.repo')
const { convertToObjectId, removeUndefinedObject } = require('../utils/functions')
const { findShopByIdAndUserId, getShopWithStaff } = require('../models/repositories/shop.repo')
const  { INVENTORY_ACTION_EXPORT, INVENTORY_ACTION_IMPORT } = require('../utils/constants')

class InventoryService {
    static async createInventory ({productId, stock,shopId,location = 'Warehouse' }) {
        const convertProductId = convertToObjectId(productId)
        if (await getInventoryByProductId(convertProductId)) throw new BadRequestError('This product is already in stock')
        return await inventoryDB.create({productId, stock,location, shopId}) 
    }

    static async updateInventoryForPaymentOrder (productId, orderId, {stock, sold, history}) {
        const convertProductId = convertToObjectId(productId)
        const inventory = await getInventoryByProductId(convertProductId)
        if (!inventory) throw new BadRequestError('Not found inventory for This product')

        // check order's stock after handle service order
        
        const query = {
            productId: convertProductId
        }, update = {
            $inc : { stock:-stock, sold: +sold },
            $push: { history: {
                reason: `payment order ${orderId}`,
                action: INVENTORY_ACTION_EXPORT,
                oldStock: inventory.stock,
                quantity: stock,
                date: Date.now
            }}
        }

        return await updateInventory(query, update)
    }

    static async updateInventoryForReturnOrder (productId, orderId, {stock, sold}) {
        const convertProductId = convertToObjectId(productId)
        const inventory = await getInventoryByProductId(convertProductId)
        if (!inventory) throw new BadRequestError('Not found inventory for This product')

        // check order's stock after handle service order
        
        const query = {
            productId: convertProductId
        }, update = {
            $inc : { stock:+stock, sold: -sold },
            $push: { history: {
                reason: `Return order ${orderId}`,
                action: INVENTORY_ACTION_EXPORT,
                oldStock: inventory.stock,
                quantity: stock,
                date: new Date()
            }}
        }

        return await updateInventory(query, update)
    }

    static async updateInventoryForCancelOrder (productId, orderId, {stock, sold}) {
        const convertProductId = convertToObjectId(productId)
        const inventory = await getInventoryByProductId(convertProductId)
        if (!inventory) throw new BadRequestError('Not found inventory for This product')

        // check order's stock after handle service order
        const query = {
            productId: convertProductId
        }, update = {
            $inc : { stock:+stock, sold: -sold },
            $push: { history: {
                reason: `Cancel order ${orderId}`,
                action: INVENTORY_ACTION_EXPORT,
                oldStock: inventory.stock,
                quantity: stock,
                date: new Date()
            }}
        }

        return await updateInventory(query, update)
    }

    static async addStockByAdmin (userId,productId,{stock, shopId}) {
        const convertProductId = convertToObjectId(productId)
        const inventory = await getInventoryByProductId(convertProductId)
        if (!inventory) throw new BadRequestError('Not found inventory for This product')
        
        if (!await findShopByIdAndUserId(shopId,userId)) {
            if (!await getShopWithStaff(shopId,userId)) throw new BadRequestError('Invalid permission')
        }

        const query = {
            productId: convertProductId
        }, update = {
            $inc : { stock:+stock },
            $push: { history: {
                reason: `Add stock by shop`,
                action: INVENTORY_ACTION_IMPORT,
                oldStock: inventory.stock,
                quantity: stock,
                date: new Date()
            }}
        }

        console.log(update)
        
        return await updateInventory(query, update)
    }

    static async subtractStockByAdmin (userId,productId,{stock, shopId}) {
        const convertProductId = convertToObjectId(productId)
        const inventory = await getInventoryByProductId(convertProductId)
        if (!inventory) throw new BadRequestError('Not found inventory for This product')

        if (!await findShopByIdAndUserId(shopId,userId)) {
            if (!await getShopWithStaff(shopId,userId)) throw new BadRequestError('Invalid permission')
        }

        const query = {
            productId: convertProductId
        }, update = {
            $inc : { stock:-stock },
            $push: { history: {
                reason: `subtract stock by shop`,
                action: INVENTORY_ACTION_EXPORT,
                oldStock: inventory.stock,
                quantity: stock,
                date: new Date()
            }}
        }
            
            return await updateInventory(query, update)
    }

    static async updateInventory (userId, productId,{reserved,lowStockThreshold, status, location, shopId}) {
        const convertProductId = convertToObjectId(productId)
        const inventory = await getInventoryByProductId(convertProductId)
        if (!inventory) throw new BadRequestError('Not found inventory for This product')

        const inventoryUpdate = removeUndefinedObject({reserved,lowStockThreshold, status, location})

        if (!await findShopByIdAndUserId(shopId,userId)) {
            if (!await getShopWithStaff(shopId,userId)) throw new BadRequestError('Invalid permission')
        }

        const query = {
            productId: convertProductId
        }, update = inventoryUpdate
        
        return await updateInventory(query, update)
    }

    static async getListInventoryByShop (shopId) {
        return await getListInventoryByShop(shopId)
    }

}

module.exports = InventoryService