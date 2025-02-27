'use strict'

const slugify = require('slugify')
const { model, Schema } = require('mongoose')
const { CATEGORY_LIST } = require('../utils/constants')


const COLLECTION_NAME = 'Products'
const DOCUMENT_NAME = 'Product'

const productSchema = new Schema({
    sku: {type: String, required: true},
    shopId: { type: Schema.Types.ObjectId, ref: 'Shop', required: true},
    createdUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true},
    productName: {type:String, required: true},
    thumbs: {type: [String], default: []},
    adsPicture: {type: String, required: true },
    brand: { type: String, required: true },
    price: {type: Number, required: true},
    priceReduction: {type: Number, default: 0},
    releaseDate: {type: Date, required: true},
    description: {
        type: {
            desCommon: {type: String, default: ''},
            listText: {
                type:  [{
                    index: Number,
                    text: String
                }],
                default: []
            },
            listPicture: {
                type:  [
                    {
                        index: Number,
                        img: String
                    }
                ],
                default: []
            }
        }
    },
    slug: String,
    type: { type: String, required: true, enum: CATEGORY_LIST},
    attributes: {type: Schema.Types.Mixed, default:{}},
    ratingsAverage: {
        type: Number,
        default: 4.5,
        min: [1, 'Rating must be above 1.0'],
        max: [5, 'Rating must be above 5.0'],
        set: (val) => Math.round(val * 10) / 10
    },
    isDraft: {type: Boolean, default: true, index: true, select: false},
    isPublished: { type: Boolean, default: false, index: true, select: false},
    guarantee: {type: String, default: 'by invoice'},
    isDeleted: {type: Boolean, default: false},
}, {
    collection: COLLECTION_NAME,
    timestamps: {
        createdAt: 'createdOn',
        updatedAt: 'modifiedOn'
    },
})

productSchema.pre('save', function(next){
    this.slug = slugify(this.productName, {lower: true})
    next()
})

const clothingSchema = new Schema({
    material: String,
    model: String,
    img: {type: String, default: ''},
    shopId: { type: Schema.Types.ObjectId, ref : 'Shop'},
}, {
    collection: 'clothes',
    timestamps: {
        createdAt: 'createdOn',
        updatedAt: 'modifiedOn'
    },
})

const electronicSchema = new Schema({
    manufacture: { type: String, required: true },
    model: String,
    shopId: { type: Schema.Types.ObjectId, ref : 'Shop'},
}, {
    collection: 'electronics',
    timestamps: {
        createdAt: 'createdOn',
        updatedAt: 'modifiedOn'
    },
})

const furnitureSchema = new Schema({
    material: String,
    manufacture: { type: String, required: true },
    shopId: { type: Schema.Types.ObjectId, ref : 'Shop'},

}, {
    collection: 'furniture',
    timestamps: {
        createdAt: 'createdOn',
        updatedAt: 'modifiedOn'
    },
})

module.exports = {
    productDB: model(DOCUMENT_NAME,productSchema),
    productElectronicDB: model('Electronics', electronicSchema),
    productClothingDB: model('Clothing', clothingSchema),
    productFurnitureDB: model('Furniture', furnitureSchema),
}