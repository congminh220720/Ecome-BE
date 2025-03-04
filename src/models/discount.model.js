'use strict'

const { model, Schema } = require('mongoose')
const {  DISCOUNT_FIXED_AMOUNT,DISCOUNT_APPLY_ALL,DISCOUNT_APPLY_SPECIFIC, DISCOUNT_TYPES} = require('../utils/constants')

const COLLECTION_NAME = 'Discounts'
const DOCUMENT_NAME = 'Discount'

const discountSchema = new Schema({
    name: {type: String, required: true },
    description: String,
    code: {type: String, required: true, unique: true, index: true},
    type: {type: String, enum: DISCOUNT_TYPES, default: DISCOUNT_FIXED_AMOUNT},
    value: {type: Number, required: true},
    maxValue: {type: Number, required: true},
    startDay: {type: Date, required: true},
    endDay: {type: Date, required: true},
    useCount: {type: Number, default: 0},
    userUsed: {type: [{type: Schema.Types.ObjectId, ref: 'User'}], default:[]},
    maxUse: { type: Number, required: true },
    minOrderValue: {type: Number, required: true},
    maxUserPerUse: {type: Number, required: true},
    productIds: {type: [{ type: Schema.Types.ObjectId, ref: 'Product'}], default: []},
    shopId: {type: Schema.Types.ObjectId, ref: 'Shop'},
    isActive: {type: Boolean, default: true},
    applies: {type: String, enum: [DISCOUNT_APPLY_ALL,DISCOUNT_APPLY_SPECIFIC], default: DISCOUNT_APPLY_ALL}
},{
    collection: COLLECTION_NAME,
    timestamps: {
        createdAt: 'createdOn',
        updatedAt: 'modifiedOn'
    }
}) 


// it call mongodb Middleware
discountSchema.pre('save', function(next){
    if (!this.startDay || !this.endDay) {
        return next(new Error('Both startDay and endDay are required!'));
    }
    if (this.endDay < this.startDay) {
        return next(new Error('End date must be greater than or equal to start date!'));
    }
    
    next()
})

module.exports = {
    discountDB: model(DOCUMENT_NAME, discountSchema)
}