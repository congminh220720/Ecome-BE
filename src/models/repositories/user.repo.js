'use strict'

const { userDB } = require('../user.model')
const { userAddressDB } = require('../userAddress.model')

const getUserByEmail = (email) =>  userDB.findOne({email}).lean()

const getUserById = (id) => userDB.findById(id).lean()

const removeFiledNotNeedUser = (user) => {
    delete user.oldPasswords
    delete user.changePasswordCount
    delete user.loginCount
    delete user.incorrectLoginCount
    delete user.password
    delete user.__v

    return {...user}
}

const addFollowShopCount = async (userId) => {
    return await userDB.findByIdAndUpdate({_id: userId}, { $inc: {followShopCount: 1}})
}

const subtractFollowShopCount = async (userId) => {
    return await userDB.findByIdAndUpdate({_id: userId}, { $inc: {followShopCount: -1}})
}

const getUserAddressByUserId = async (userId) => {
    return await userAddressDB.find({ userId: userId }).sort({ createdOn: -1 }).lean()
}

const getUserAddressById = async (id) => {
    return await userAddressDB.findById(id).lean()
}

const removeAddressById = async (id) => {
    return await userAddressDB.findOneAndDelete({ _id: id });
}

const findAddressByIdAndUser = async (id, userId) => {
    return await userAddressDB.findOne({ _id: id, userId: userId }).lean()
}

module.exports = {
    getUserByEmail,
    getUserById,
    removeFiledNotNeedUser,
    addFollowShopCount,
    subtractFollowShopCount,
    getUserAddressByUserId,
    getUserAddressById,
    removeAddressById,
    findAddressByIdAndUser
}