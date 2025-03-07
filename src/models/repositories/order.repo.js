'use strict'
const { getSelectData } = require('../../utils/functions')
const { OrderGroupDB, orderDB } = require('../order.model')

const getOrderGroupById = async (orderGroupId) => {
    return await OrderGroupDB.findById(orderGroupId).lean()
}

const getChildrenOrderByOrderGroupId = async (orderGroupId, select = []) => {
    return await orderDB.find({orderGroupId}).select(getSelectData(select)).lean()
}

const getOrderGroupByUserId = async (userId) => {
    return await OrderGroupDB.find({userId}).lean()
}

const getOrderById = async (id) => {
    return await orderDB.findById(id).lean()
}

const getOrderGroupByIdAndStatus = async (userId, status) => {
    return await OrderGroupDB.find({userId,status}).lean()
}

const getOrderByIdAndStatus = async (userId, status) => {
    return await orderDB.find({userId,status}).lean()
}

const getShopsOrderByStatus = async (shopId, status) => {
     const aa = await orderDB.find({shopId,status}).lean()
     console.log(aa)
     return aa
}

const getShopOrders = async (shopId) => {
    return await orderDB.find({shopId}).lean()
}


module.exports = {
    getOrderGroupById,
    getChildrenOrderByOrderGroupId,
    getOrderGroupByUserId,
    getOrderByIdAndStatus,
    getShopsOrderByStatus,
    getShopOrders,
    getOrderGroupByIdAndStatus,
    getOrderById
}