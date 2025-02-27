'use strict'
const fs = require('fs');
const md5 = require('md5')
const { userDB } = require('../models/user.model')
const { userAddressDB } = require('../models/userAddress.model')
const { userFollowShopDB } = require('../models/userFollowShop.model')
const { getUserByEmail, getUserById, removeFiledNotNeedUser, removeAddressById, getUserAddressByUserId, findAddressByIdAndUser } = require('../models/repositories/user.repo')
const { convertToObjectId, removeUndefinedObject } = require('../utils/functions')
const { createTokenPair } = require('../auth/authUtils')
const { BadRequestError } = require('../core/error.response');
const KeyTokenService = require('./keyToken.service');

const { MAX_LOGIN_INCORRECT, EMAIL_REGEX } = require('../utils/constants')

const MIN_PASSWORD = 8

const publicKey = fs.readFileSync(process.env.JWT_PUBLIC_KEY_PATH)
const privateKey = fs.readFileSync(process.env.JWT_PRIVATE_KEY_PATH)

// sign (POST) -> email, password, birthday, 
// login (POST) -> email, password, 
// updateUser (PATH) allow -> name, birthday, avatar
// getUser -> (GET) query -> userId
// resetPassword -> (PATH) -> pin, newPassword ! (make after handle send email service)
// changePassword -> (PATH) -> newPassword, currentPassword

// saveUserAddress -> POST 
// updateUserAddress -> PATCH 
// getListUserAddress -> GET 
// removeUserAddress -> DELETE -> make soft deleted 

class UserService {
    static async signin({email, password, name, phone}) {
        if (!password && !password.length > MIN_PASSWORD) throw new BadRequestError('Invalid password')
        if (!name) throw new BadRequestError('Invalid name')
        if (!phone) throw new BadRequestError('Invalid phone')
        if (!email && !EMAIL_REGEX.test(email)) throw new BadRequestError('Invalid email')

        const hashPassword = md5(password)
        const userExists = await getUserByEmail(email)
        if (userExists) throw new BadRequestError('User is exists !')
        
        let user = await userDB.create({
            email,
            password: hashPassword,
            name,
            phone
        })
        user = user.toObject()
        user._id = user._id.toString()

        const newUser = removeFiledNotNeedUser(user)
        console.log(newUser)
        const { accessToken, refreshToken } = await createTokenPair(newUser,publicKey, privateKey)

        await KeyTokenService.createKeyToken({userId: convertToObjectId(newUser._id), refreshToken })
        await userFollowShopDB.create({userId: convertToObjectId(user._id)})
        
        newUser.accessToken = accessToken
        newUser.refreshToken = refreshToken
        return newUser
    }

    static async login ({email, password}) {
        if (!password && !password.length > MIN_PASSWORD) throw new BadRequestError('Invalid password')
        if (!email && !EMAIL_REGEX.test(email)) throw new BadRequestError('Invalid email')

        const hashPassword = md5(password)
        const userExists = await getUserByEmail(email)
        if (!userExists) throw new BadRequestError('User is not exists !')
        if (userExists.password !== hashPassword) {
            if (userExists.incorrectLoginCount >= MAX_LOGIN_INCORRECT ) {
                throw new BadRequestError('Contact to admin to be support please !')
            }

            const query = {
                email: email
            }, update = {
                $inc: { incorrectLoginCount: 1}
            }

            await userDB.updateOne(query, update)
            throw new BadRequestError('incorrect password')
        } 

        const query = {
            email: email
        }, update = {
            $inc: { loginCount: 1}
        }

        let user = await userDB.findOneAndUpdate(query, update,  {new: true})
        user = user.toObject()
        user._id = user._id.toString()

        const { accessToken, refreshToken } = await createTokenPair(removeFiledNotNeedUser(user),publicKey, privateKey)
        await KeyTokenService.createKeyToken({userId: convertToObjectId(userExists._id), refreshToken })

        user.accessToken = accessToken
        user.refreshToken = refreshToken

        return user
    }

    static async updateUser (userId, {name, avatar, birthday, phone}) {
        const user = await getUserById(userId)
        if (!user) throw new BadRequestError('User not found')
        const updateUser = removeUndefinedObject({name, avatar, birthday, phone})

        const query = {
            _id: userId
        }
        
        let newUser = await userDB.findByIdAndUpdate(query,updateUser, {new: true})
        newUser = newUser.toObject()
        return removeFiledNotNeedUser(newUser)
    }

    static async getUsers (userId) {
        const user = await getUserById(userId)
        if (!user) throw new BadRequestError('User not found')

        return removeFiledNotNeedUser(user)
    }

    static async changePassword (userId, {password, newPassword}) {
        const user = await getUserById(userId)
        const hashNewPassword = md5(newPassword)
        if (!user) throw new BadRequestError('User not found')

        if (md5(password) !== user.password) throw new BadRequestError('incorrect password')

        const oldPasswords = user.oldPasswords
        if (oldPasswords.includes(hashNewPassword)) throw new BadRequestError('Don\'t use old password !')
        

        const query = {
            _id: userId
        }, update = {
            $push: {oldPasswords: md5(password)},
            password: hashNewPassword,
            $inc : { changePasswordCount: 1}
        }
        
        const newUser = await userDB.findByIdAndUpdate(query, update, {new: true})
        return {}
    }

    static logout = async (keyStore) => {
        return await KeyTokenService.removeKeyToken(keyStore._id)
    }

    static async refreshToken (userId, {refreshToken}) {
        const userKeyToken = await KeyTokenService.findByUserId(userId)
        if (!userKeyToken) throw new BadRequestError('User not found')
        
        if (refreshToken !== userKeyToken.refreshToken) throw new BadRequestError('Invalid refresh token')

        const user = await getUserById(userId)
        return await createTokenPair(removeFiledNotNeedUser(user),publicKey, privateKey)
       
    }

    static async saveUserAddress (userId, {label,recipientName,phone, addressLine1, addressLine2 = '', city, state, postalCode, isDefault}) {
        const user = await getUserById(userId)
        if (!user) throw new BadRequestError('User not found')

        const userAddress = {
            userId: convertToObjectId(userId),
            label,recipientName,phone, addressLine2, city, state, postalCode, isDefault, addressLine1
        }

        let newUserAddress = await userAddressDB.create(userAddress)
        return newUserAddress.toObject()
        
    }

    static async updateUserAddress (userId,addressId,{label,recipientName,phone,addressLine1, addressLine2, city, state, postalCode, isDefault}) {
        const user = await getUserById(userId)
        if (!user) throw new BadRequestError('User not found')

        const userAddress = await findAddressByIdAndUser(addressId, convertToObjectId(userId))
        if (!userAddress) throw new BadRequestError('Address not found')
        
        let addressUpdate = removeUndefinedObject({label,recipientName,phone, addressLine1, addressLine2, city, state, postalCode, isDefault})

        const query = {
            _id: addressId
        }, options = {
            new: true
        }

        const result = await userAddressDB.findOneAndUpdate(query, addressUpdate, options)
        return result.toObject()
    }

    static async getListUserAddress (userId) {
        const user = await getUserById(userId)
        if (!user) throw new BadRequestError('User not found')
        return await getUserAddressByUserId(convertToObjectId(userId))
    }

    static async removeUserAddress (userId, addressId) {
        const user = await getUserById(userId)
        if (!user) throw new BadRequestError('User not found')

        const userAddress = await findAddressByIdAndUser(addressId, convertToObjectId(userId))
        if (!userAddress) throw new BadRequestError('Address not found')

        await removeAddressById(addressId)

        return {}
    }
}



module.exports = UserService