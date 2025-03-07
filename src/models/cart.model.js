'use strict'

const { model, Schema } = require('mongoose')
const { CART_STATES, CART_STATE_PENDING } = require('../utils/constants')

const COLLECTION_NAME = 'Carts'
const DOCUMENT_NAME = 'Cart'


const cartSchema = new Schema({
    userId: {type: Schema.Types.ObjectId, ref: 'User' ,required: true},
    items: {type: [
        {
            shopId: {type: Schema.Types.ObjectId, ref: 'Shop', required: true},
            productId: {type: Schema.Types.ObjectId, ref: 'Product'},
            quantity: {type: Number, required: true, min: 0},
            price: {type: Number, required: true, min:0},
        }
    ],_id: false, default: []},
    totalPrice: {type: Number, required: true},
    status: { type: String, enum:CART_STATES, default: CART_STATE_PENDING }
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
});

cartSchema.pre('findOneAndUpdate', function (next) {
    const update = this.getUpdate();

    if (update.items) {
        const newTotalPrice = update.items.reduce((total, item) => total + item.price * item.quantity, 0);
        this.set({ totalPrice: newTotalPrice });
    }

    next();
});

cartSchema.index({ userId: 1 }, { unique: true });


module.exports = {
    cartDB: model(DOCUMENT_NAME,cartSchema)
}