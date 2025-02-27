'use strict'

const { model, Schema } = require('mongoose')

const COLLECTION_NAME = 'ShopFollowers'
const DOCUMENT_NAME = 'ShopFollower'


const shopFollowersSchema = new Schema({
    shopId: {type: Schema.Types.ObjectId, ref: 'Shop'},
    followers: {type: [{
        userId: {type: Schema.Types.ObjectId, ref: 'User', required: true},
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
    shopFollowersDB: model(DOCUMENT_NAME,shopFollowersSchema)
}