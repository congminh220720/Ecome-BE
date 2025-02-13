'use strict'

const { keyTokenDB } = require('../models/keyToken.model')
const mongoose = require('mongoose')

class KeyTokenService {
    static async createKeyToken ({userId, refreshToken}) {
        try {
            const filter = { userId:  userId }, update = { refreshToken }, options = { upsert: true}
            await keyTokenDB.findOneAndUpdate(filter, update, options)
            console.log(1)
          } catch (e) {return e}
    }

    static async removeKeyToken (id) {
        return await keyTokenDB.deleteOne({_id:id})
    }

    static findByUserId = async ( userId ) => {
        return await keyTokenDB.findOne({ userId: new mongoose.Types.ObjectId(userId)})
    } 

    static findByRefreshToken = async (refreshToken) => {
        return await keyTokenDB.findOne({refreshToken})
    }

    static deleteKeyById = async (userId) => {
        return await keyTokenDB.deleteOne({ userId: new mongoose.Types.ObjectId(userId)})
    }
}

module.exports = KeyTokenService