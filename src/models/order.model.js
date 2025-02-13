'use strict'

const { model, Schema } = require('mongoose')
const { ORDER_STATUS,PAYMENT_METHOD_COD , PAYMENT_METHODS, PAYMENT_STATUS,PAYMENT_STATUS_UNPAID} = require('../utils')

const COLLECTION_NAME = 'Orders'
const DOCUMENT_NAME = 'Order'

const orderGroupSchema = new Schema({
    userId: {type: Schema.Types.ObjectId, ref: 'User'},
    orders: [{type: Schema.Types.ObjectId, ref: 'Order'}],
    totalPrice: {type: Number, required: true},
    paymentMethod: { type: String, enum: PAYMENT_METHODS, default: PAYMENT_METHOD_COD },
    paymentStatus: { type:Number, enum: PAYMENT_STATUS, default: PAYMENT_STATUS_UNPAID},
    shippingAddress: { 
        street: String, 
        city: String, 
        state: String, 
        country: String, 
        postalCode: String 
    },
    createdOn: { type: Date, default: Date.now }
}, {
    collection: orderGroup,
    timestamps: {
        createdAt: 'createdOn',
        updatedAt: 'modifiedOn'
    }, 
})

const orderSchema = new Schema({
    userId: {type: Schema.Types.ObjectId, ref: 'User', required: true},
    orderGroupId:  {type: Schema.Types.ObjectId, ref: 'OrderGroup', required: true},
    shopId: {type: Schema.Types.ObjectId, ref: 'Shop', required: true},
    totalPrice: { type: Number, required: true },
    items: [{ 
        productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
        quantity: { type: Number, required: true, min: 1 },
        price: { type: Number, required: true },
    }],
    status: { type: String, enum: ORDER_STATUS, default: ORDER_STATUS_PENDING },
    paymentStatus: { type: Number, enum: PAYMENT_STATUS, default: PAYMENT_STATUS_UNPAID },
    createdOn: { type: Date, default: Date.now }

},{
    collection: COLLECTION_NAME,
    timestamps: {
        createdAt: 'createdOn',
        updatedAt: 'modifiedOn'
    }, 
})


orderSchema.pre('save', function (next) {
    this.totalPrice = this.items.reduce((total, item) => total + item.price * item.quantity, 0);
    next();
})

module.exports = {
    orderDB: model(DOCUMENT_NAME, orderSchema),
    OrderGroupDB: model('OrderGroup', orderGroupSchema)

}