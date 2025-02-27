'use strict'

const { model, Schema } = require('mongoose')
const { USER_ADDRESSES, ADDRESS_HOME, DEFAULT_COUNTRY } = require('../utils/constants')

const COLLECTION_NAME = 'UserAddresses'
const DOCUMENT_NAME = 'UserAddress'

const userAddressSchema = new Schema({ 
    label: {type: String, enum: USER_ADDRESSES, default: ADDRESS_HOME},
    userId: {type: Schema.Types.ObjectId, ref: 'User', required: true},
    recipientName: { type: String, required: true},
    phone: { type: Number, required: true},
    addressLine1: {type: String, required: true}, 
    addressLine2: {type: String},
    city: { type: String, required: true },
    state: { type: String, required: true },
    country: { type: String, default: DEFAULT_COUNTRY },
    postalCode: { type: String, required: true },
    isDefault: { type: Boolean, default: false } 
},{
    collection: COLLECTION_NAME,
    timestamps:{
        createdAt: 'createdOn',
        updatedAt: 'modifiedOn'
    }
})


module.exports = {
    userAddressDB: model(DOCUMENT_NAME,userAddressSchema)
}