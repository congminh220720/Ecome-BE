'use strict'

const { model, Schema, Types } = require('mongoose')
const { SHOP_INACTIVE, SHOP_ACTIVE, MAX_LENGTH_NAME, SHOP_MANAGER, SHOP_COLLABORATOR } = require('../utils/constants')

const COLLECTION_NAME = 'Shops'
const DOCUMENT_NAME = 'Shops'

const staffSchema = new Schema({
    name: { type: String, required: true, trim: true, maxlength:MAX_LENGTH_NAME},
    userId: {type: Schema.Types.ObjectId, ref: 'User'},
    isActive: {type: Boolean, default: true},
    role: { type: Number, enum: [SHOP_MANAGER,SHOP_COLLABORATOR], default:SHOP_COLLABORATOR },
},{
    timestamps: {
        createdAt: 'createdOn',
        updatedAt: 'modifiedOn'
    },
})

const shopSchema = new Schema({
    name: {
        type: String,
        trim: true,
        maxlength: 150,
        required: true
    },
    email: {
        type:String,
        required:true,
        trim: true
    },
    thumb: {
        type: [String],
        default: []    
    },
    address: {type: String, required: true, min: 10},
    logo: {type: String},
    ownerId: {type: Schema.Types.ObjectId, ref: 'User'},
    description: {type: String},
    followCount: {type: Number, default: 0},
    listUserFollow:{ type: [{ type: Schema.Types.ObjectId, ref: 'User' }], default: [] },
    status: {type: String, enum: [SHOP_ACTIVE,SHOP_INACTIVE], default: SHOP_INACTIVE},
    verify: {type: Boolean, default: false},
    staff: {type: [staffSchema], default: []}
}, {
    timestamps: {
        createdAt: 'createdOn',
        updatedAt: 'modifiedOn'
    },
    collection: COLLECTION_NAME
})


module.exports = {
    shopDB: model(DOCUMENT_NAME,shopSchema)
}