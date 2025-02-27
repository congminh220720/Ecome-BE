'use strict'

const slugify = require('slugify')
const { model, Schema, Types } = require('mongoose')
const { SHOP_INACTIVE, SHOP_ACTIVE, MAX_LENGTH_NAME, SHOP_MANAGER, SHOP_COLLABORATOR } = require('../utils/constants')

const COLLECTION_NAME = 'Shops'
const DOCUMENT_NAME = 'Shops'

const MAX_USER = 5

const staffSchema = new Schema({
    nickName: { type: String, required: true, trim: true, maxlength:MAX_LENGTH_NAME},
    userId: {type: Schema.Types.ObjectId, ref: 'User', required: true},
    isActive: {type: Boolean, default: true},
    role: { type: Number, enum: [SHOP_MANAGER,SHOP_COLLABORATOR], default:SHOP_COLLABORATOR },
},{
    timestamps: {
        createdAt: 'createdOn',
        updatedAt: 'modifiedOn'
    },
})

const oldLogoSchema = new Schema({
    url: { type: String, required: true},
},{
    timestamps: {
        createdAt: 'createdOn',
    },
})

const oldThumbsSchema = new Schema({
    url: { type: String, required: true},
},{
    timestamps: {
        createdAt: 'createdOn',
    },
})

const shopSchema = new Schema({
    shopName: {
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
    address: {type: String, required: true, min: 10},
    oldLogos: {type: [oldLogoSchema], default: []},
    oldThumbs: {type: [oldThumbsSchema], default: []},
    thumb: {type: String, default: ''},
    slug: String,
    logo: {type: String, default: ''},
    ownerId: {type: Schema.Types.ObjectId, ref: 'User'},
    description: {type: String},
    staffCount:  {type: Number, default: 0},
    followCount: {type: Number, default: 0},
    status: {type: String, enum: [SHOP_ACTIVE,SHOP_INACTIVE], default: SHOP_INACTIVE},
    verify: {type: Boolean, default: false},
    staffs: {type: [staffSchema], default: [], max: MAX_USER}
}, {
    timestamps: {
        createdAt: 'createdOn',
        updatedAt: 'modifiedOn'
    },
    collection: COLLECTION_NAME
})

shopSchema.pre('save', function (next) {
    if (!this.shopName) {
        return next(new Error("shopName is required to generate slug"));
    }
    console.log(this.shopName)
    this.slug = slugify(this.shopName, { lower: true, strict: true });
    next();
});


module.exports = {
    shopDB: model(DOCUMENT_NAME,shopSchema)
}