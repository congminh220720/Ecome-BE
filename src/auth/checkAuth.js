'use strict'

const { findApiKey } = require("../services/apiKey.service")
const { HEADER } = require('../utils/constants')


const apiKey = async (req,res,next) => {
    try {
        const key = req.get(HEADER.API_KEY)?.toString()

        if (!key) {
            return res.status(403).json({
                message: 'Forbidden Error'
            })
        }

        // check objectKey
        const objectKey = await findApiKey(key)

        if (!objectKey) {
            return res.status(403).json({
                message: 'Forbidden Error'
            })
        } 

        req.objectKey = objectKey
        return next()
    } catch (e) {
        
    }
}

const permission = (permission) => {
    return (req, res, next) => {
        if (!req.objectKey.permissions) {
            return res.status(403).json({
                message: 'Permission Denied'
            })
        }

        const validPermission = req.objectKey.permissions.includes(permission)
        if (!validPermission) {
            return res.status(403).json({
                message: 'Permission Denied'
            })
        }

        return next()
    }
}

module.exports = {
    apiKey,
    permission,
}