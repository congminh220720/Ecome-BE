'use strict'

const { model, Schema } = require('mongoose')
const { CATEGORY_LIST } = require('../utils/constants')


const COLLECTION_NAME = 'Products'
const DOCUMENT_NAME = 'Product'

const productSchema = new Schema({
    name: {type:String, required: true},
    thumb: {type: [String], default: []},
    description: String,
    slug: { type: String, unique: true },
    url: {type: String, default: ""},
    price: { type: Number, required: true},
    quantity: { type: Number, required: true},
    shopId: { type: Schema.Types.ObjectId, ref: 'Shop', required: true},
    type: { type: String, required: true, enum: CATEGORY_LIST},
    attributes: {type: Schema.Types.Mixed, default:{}},
    ratingsAverage: {
        type: Number,
        default: 4.5,
        min: [1, 'Rating must be above 1.0'],
        max: [5, 'Rating must be above 5.0'],
        set: (val) => Math.round(val * 10) / 10
    },
    variation: {type: [Schema.Types.Mixed], default: []},
    isDraft: {type: Boolean, default: true, index: true, select: false},
    isPublished: { type: Boolean, default: false, index: true, select: false}
}, {
    collection: COLLECTION_NAME,
    timestamps: {
        createdAt: 'createdOn',
        updatedAt: 'modifiedOn'
    },
})

productSchema.pre('save', function(next){
    this.slug = slugify(this.name, {lower: true})
    next()
})

const clothingSchema = new Schema({
    brand: { type: String, required: true },
    size: String,
    material: String,
    shopId: { type: Schema.Types.ObjectId, ref : 'Shop', required: true},
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
    color: String,
    shopId: { type: Schema.Types.ObjectId, ref : 'Shop', required: true}
}, {
    collection: 'electronics',
    timestamps: {
        createdAt: 'createdOn',
        updatedAt: 'modifiedOn'
    },
})

const furnitureSchema = new Schema({
    brand: { type: String, required: true },
    size: String,
    material: String,
    shopId: { type: Schema.Types.ObjectId, ref : 'Shop', required: true},
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