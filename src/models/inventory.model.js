'use strict'

const { model, Schema } = require('mongoose')
const { INVENTORY_STATUS, INVENTORY_IN_STOCK, INVENTORY_ACTION } = require('../utils/constants')

const COLLECTION_NAME = 'Inventories'
const DOCUMENT_NAME = 'Inventory'

const inventorySchema = new Schema({
    shopId:  {type: Schema.Types.ObjectId, ref: 'Shop'},
    productId: {type: Schema.Types.ObjectId, ref: 'Product'},
    quantity: {type: Number, required: true},
    sold: {type: Number, default: 0},
    reserved:{ type: Number, default: 0 },
    lowStockThreshold: { type: Number, default: 10 },
    status: { type: String, enum:[INVENTORY_STATUS], default: INVENTORY_IN_STOCK},
    location: { 
        type: String, 
        default: 'Warehouse' // warehouse location
    },
    history: [
        {
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
    keyTokenDB: model(DOCUMENT_NAME,inventorySchema)
}