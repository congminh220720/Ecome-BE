'use strict'

const JWT = require('jsonwebtoken')
const fs = require('fs');
const { asyncHandler } = require('../helpers/asyncHandler')
const { AuthFailureError, NotFoundError } = require('../core/error.response')
const { HEADER } = require('../utils/constants')
const { findByUserId } = require('../services/keyToken.service')


const createTokenPair = async (payload, publicKey, privateKey) => {
    try {
        const accessToken = await JWT.sign(payload, privateKey, {
            algorithm: 'ES256',
            expiresIn: '2 days'
        })

        const refreshToken = await JWT.sign(payload, privateKey, {
            algorithm: 'ES256',
            expiresIn: '7 days'
        })

        // JWT.verify(accessToken,publicKey, { algorithms: ['ES256'] }, (error, decoded) =>{
        //     if (error) {
        //         console.log(`verify :: error ${error}`)
        //     } else {
        //         console.log(`verify success::: ${decoded}`)
        //     }
        // })

        return { accessToken, refreshToken }
    } catch (e) {
        console.log(e)
    }
}

const authenticationV2 = asyncHandler( async (req,res,next) => {
    let decoded = {}
    var privateKey = fs.readFileSync(process.env.JWT_PUBLIC_KEY_PATH)
    let userToken = req.get(HEADER.AUTHORIZATION)

    if (!userToken) throw new AuthFailureError('Invalid Token')
    userToken = userToken.replace('Bearer ', '');

    try {
        decoded = JWT.verify(userToken, privateKey)
    } catch (e) {
        throw new AuthFailureError('Unauthorized')
    }    
    
    const keyStore = await findByUserId(decoded._id)
    if (!keyStore) throw new NotFoundError('Not found keyStore')
       
    if (req.get(HEADER.REFRESHTOKEN)) {
        try {
            const refreshToken = req.get(HEADER.REFRESHTOKEN)
            const decoded = JWT.verify(refreshToken, privateKey)
            if (userId !== decoded.uid) throw new AuthFailureError('Invalid User Id')
            req.keyStore = keyStore
            req.user = decoded
            req.refreshToken = refreshToken
            return next()
        } catch (e) { throw e }
    }
    
    req.keyStore = keyStore
    req.user = decoded
    return next()
})


const verifyJWT = async (token, keySecret) => {
    return JWT.verify(token, keySecret)
}

module.exports = {
    createTokenPair,
    verifyJWT,
    authenticationV2
}