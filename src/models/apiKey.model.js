'use strict'
const { model, Schema, Types} = require('mongoose')

const { PERMISSIONS } = require('../utils/constants')

const DOCUMENT_NAME = 'ApiKey'
const COLLECTION_NAME = 'ApiKeys'

const apiKeySchema = new Schema({
    key: {
        type:String,
        required: true,
        unique:true,
    },
    status: {
        type:Boolean,
        default: true,
    },
    permissions: {
        type: [String],
        required:true,
        enum: PERMISSIONS
    }
}, {
    timestamps: true,
    collection: COLLECTION_NAME
})

module.exports = model(DOCUMENT_NAME,apiKeySchema)