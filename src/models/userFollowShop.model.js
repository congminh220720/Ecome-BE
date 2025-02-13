'use strict'

const { model, Schema } = require('mongoose')

const COLLECTION_NAME = 'UserFollowShops'
const DOCUMENT_NAME = 'UserFollowShop'

const userFollowShopSchema = new Schema({
    userId: {type: Schema.Types.ObjectId, ref: 'User'},
    listShopFollow: {type: Array, default: [ {type: Schema.Types.ObjectId, ref: 'Shop', required: true}]}

}, {
    collection: COLLECTION_NAME,
    timestamps: {
        createdAt: 'createdOn',
        updatedAt: 'modifiedOn'
    },
})

module.exports = {
    userFollowShopDB: model(DOCUMENT_NAME,userFollowShopSchema)
}