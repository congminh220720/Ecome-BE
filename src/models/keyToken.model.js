'use strict'

const { model, Schema } = require('mongoose')

const COLLECTION_NAME = 'KeyTokens'
const DOCUMENT_NAME = 'KeyToken'

const keyTokenSchema = new Schema({
    userId: {type: Schema.Types.ObjectId, ref: 'User', required: true},
    refreshTokenUsed: {
        type: [String],
        default: [] 
    },
    refreshToken: {
        type: String,
        required: true
    }
},{
    collection: COLLECTION_NAME,
    timestamps: {
        createdAt: 'createdOn',
        updatedAt: 'modifiedOn'
    }, 
})

module.exports = {
    keyTokenDB: model(DOCUMENT_NAME,keyTokenSchema)
}