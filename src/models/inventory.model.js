'use strict'

const { model, Schema } = require('mongoose')
const { INVENTORY_STATUS, INVENTORY_IN_STOCK, INVENTORY_ACTION } = require('../utils/constants')

const COLLECTION_NAME = 'Inventories'
const DOCUMENT_NAME = 'Inventory'

const inventorySchema = new Schema({
    shopId: {type: Schema.Types.ObjectId, ref: 'ShopId'},
    productId: {type: Schema.Types.ObjectId, ref: 'Product'},
    stock: {type: Number, required: true, min: 0},
    sold: {type: Number, default: 0, min: 0},
    reserved:{ type: Number, default: 0 },
    lowStockThreshold: { type: Number, default: 10, min: 0 },
    status: { type: String, enum:INVENTORY_STATUS, default: INVENTORY_IN_STOCK},
    location: { 
        type: String, 
        default: 'Warehouse' // warehouse location
    },
    history: [
        {   
            reason: {type: String, required: true},
            action: { type: String, enum: INVENTORY_ACTION, required: true },
            quantity: { type: Number, required: true },
            date: { type: Date, default: Date.now }
        }
    ]

},{
    collection: COLLECTION_NAME,
    timestamps: {
        createdAt: 'createdOn',
        updatedAt: 'modifiedOn'
    }, 
})

module.exports = {
    inventoryDB: model(DOCUMENT_NAME,inventorySchema)
}