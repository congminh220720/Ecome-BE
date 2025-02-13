'use strict'

const { model, Schema } = require('mongoose')
const { CART_STATES, CART_STATE_PENDING } = require('../utils/constants')

const COLLECTION_NAME = 'Carts'
const DOCUMENT_NAME = 'Cart'


const itemSchema = new Schema({
    shopId: {type: Schema.Types.ObjectId, ref: 'Shop'},
    productId: {type: Schema.Types.ObjectId, ref: 'Product'},
    quantity: {type: Number, required: true},
    price: {type: Number, required: true},
})


const cartSchema = new Schema({
    userId: {type: Schema.Types.ObjectId, ref: 'User' ,required: true},
    items: {type: [itemSchema], default: []},
    totalPrice: {type: Number, default: 0}
}, {
    collection: COLLECTION_NAME,
    timestamps: {
        createdAt: 'createdOn',
        updatedAt: 'modifiedOn'
    },
})

cartSchema.pre('save', function (next) {
    this.totalPrice = this.items.reduce((total, item) => total + item.price * item.quantity, 0);
    next();
})

module.exports = {
    cartDB: model(DOCUMENT_NAME,cartSchema)
}