'use strict'

const { model, Schema } = require('mongoose')
const {USER_ACTIVE, USER_BE_BANED, SHOP_MANAGER, SHOP_COLLABORATOR } = require('../utils/constants')

const COLLECTION_NAME = 'Users'
const DOCUMENT_NAME = 'User'

const contributorSchema = new Schema({
    shopId: {type: Schema.Types.ObjectId, ref: 'Shop'},
    isActive: {type: Boolean, default: true},
    role: { type: Number, enum: [SHOP_MANAGER,SHOP_COLLABORATOR], default:SHOP_COLLABORATOR },
},{
    timestamps: {
        createdAt: 'createdOn',
        updatedAt: 'modifiedOn'
    },
})

const userSchema = new Schema({
    name: {type: String, trim: true, maxLength: 150},
    email: {type: String, required: true, unique: true, index: true},
    password: {type: String, require: true},
    status: {type: String, enum: [USER_ACTIVE,USER_BE_BANED], default: USER_ACTIVE},
    contributors: {type: [contributorSchema], default: []},
    isShopOwner: {type: Boolean, default: false},
    oldPasswords: {type: [String], default: []},
    changePasswordCount: { type: Number, default: 0},
    birthday: { type: Date , required: false},
    avatar: {type: String, default: ''},
    loginCount: {type: Number, default:0},
    incorrectLoginCount: {type: Number, default: 0},
    orderCount: {type: Number, default: 0}
}, {
    collection: COLLECTION_NAME,
    timestamps: {
        createdAt: 'createdOn',
        updatedAt: 'modifiedOn'
    },
})

module.exports = {
    userDB: model(DOCUMENT_NAME,userSchema)
}