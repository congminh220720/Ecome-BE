'use strict'

const { Types } = require('mongoose')

const convertToObjectId = id => new Types.ObjectId(id)

const removeUndefinedObject = (obj) => {
    Object.keys(obj).forEach( k => {
        if (obj[k] == null) {
            delete obj[k]
        }
    })

    return obj
}

module.exports = {
    convertToObjectId,
    removeUndefinedObject
}