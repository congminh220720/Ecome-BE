'use strict'

const { model, Schema } = require('mongoose')

const COLLECTION_NAME = 'UserFollowShops'
const DOCUMENT_NAME = 'UserFollowShop'


const userFollowShopSchema = new Schema({
    userId: {type: Schema.Types.ObjectId, ref: 'User'},
    listShopFollow: {type: [{
        shopId: {type: Schema.Types.ObjectId, ref: 'Shop', required: true},
        followDate: {type: Date, default: new Date()}
    }], default: []}

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