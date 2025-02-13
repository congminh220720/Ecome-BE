'use strict'

const apiKeyDB  = require('../models/apiKey.model')
const crypto = require('crypto')
const { FULL_PER } = require('../utils/constants')

const findApiKey = async (key) => {
    // const newKey = await apiKeyDB.create({ key: crypto.randomBytes(64).toString('hex'), permissions: [FULL_PER]})
    // console.log(newKey)
    return apiKeyDB.findOne({key: key, status: true}).lean()
}

module.exports = {
    findApiKey
}