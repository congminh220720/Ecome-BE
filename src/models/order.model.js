'use strict'
const { model, Schema } = require('mongoose')
const { ORDER_STATUS, ORDER_STATUS_PENDING, PAYMENT_METHOD_COD , PAYMENT_METHODS, PAYMENT_STATUS,PAYMENT_STATUS_UNPAID,SHIPPING_STATUS_PENDING, SHIPPING_STATUS} = require('../utils/constants')

const COLLECTION_NAME = 'Orders'
const DOCUMENT_NAME = 'Order'

const orderGroupSchema = new Schema({
    userId: {type: Schema.Types.ObjectId, ref: 'User'},
    orders: {type: [{type: Schema.Types.ObjectId, ref: 'Order'}], default: []},
    totalPrice: {type: Number, required: true},
    status: { type: String, enum: ORDER_STATUS, default: ORDER_STATUS_PENDING },
    paymentMethod: { type: String, enum: PAYMENT_METHODS, default: PAYMENT_METHOD_COD },
    paymentStatus: { type:String, enum: PAYMENT_STATUS, default: PAYMENT_STATUS_UNPAID},
    expectedDeliveryDate: { type: Date },
    shippingAddress: { 
        street: {type: String, default: ''}, 
        city:  {type: String, default: ''},
        state:  {type: String, default: ''}, 
        country:  {type: String, default: ''}, 
        postalCode:  {type: String, default: ''} 
    },
    paymentDetails: {
        transactionId: {type: String, default: ''},
        paidAmount: { type: Number, default: 0 },
        paidAt: { type: Date, default: '' }
    },
    note: { type: String, default: "" },
    createdOn: { type: Date, default: Date.now },
    listDiscountApply: [{
        shopId: { type: Schema.Types.ObjectId, ref: 'Shop', required: true },
        code: String,
        discountAmount: { type: Number, default: 0 },
    }],
    statusHistory: [{
        status: { type: String, enum: ORDER_STATUS, default: ORDER_STATUS_PENDING},
        updatedAt: { type: Date, default: Date.now }
    }],
}, {
    collection: 'OrderGroups',
    timestamps: {
        createdAt: 'createdOn',
        updatedAt: 'modifiedOn'
    }, 
})

const orderSchema = new Schema({
    userId: {type: Schema.Types.ObjectId, ref: 'User', required: true},
    orderGroupId:  {type: Schema.Types.ObjectId, ref: 'OrderGroup', required: true},
    shopId: {type: Schema.Types.ObjectId, ref: 'Shop', required: true},
    status: { type: String, enum: ORDER_STATUS, default: ORDER_STATUS_PENDING },
    paymentStatus: { type:String, enum: PAYMENT_STATUS, default: PAYMENT_STATUS_UNPAID},
    trackingNumber: { type: String, default: null },  
    shippingFee: { type: Number, default: 0 },
    shippingStatus: { type: String, enum:SHIPPING_STATUS, default: SHIPPING_STATUS_PENDING },
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true },
    discount: {
        type : {
            code: {type: String, default: ''},
            discountAmount: {type: Number, default: 0}
        },
        _id: false,
        default: {}
    },
    returnRequest: {
        requested: { type: Boolean, default: false },
        reason: String,
        approved: { type: Boolean, default: false },
        processedAt: Date
    },
},{
    collection: COLLECTION_NAME,
    timestamps: {
        createdAt: 'createdOn',
        updatedAt: 'modifiedOn'
    }, 
})


module.exports = {
    orderDB: model(DOCUMENT_NAME, orderSchema),
    OrderGroupDB: model('OrderGroup', orderGroupSchema)
}