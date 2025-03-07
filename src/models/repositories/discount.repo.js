const { discountDB } = require('../discount.model')
const { getUnSelectData } = require('../../utils/functions')

const unSelect = ['updatedAt','__v','userUsed']

const listDiscountByProductId = async (productId) => {
    return await discountDB.find({
        productIds:productId
    }).select(getUnSelectData(unSelect)).lean()
}

const listDiscountByShopId = async (shopId) => {
    return await discountDB.find({shopId}).select(getUnSelectData(unSelect)).lean()
}

const getCodeDetail = async (code,shopId) => {
    return await discountDB.findOne({code,shopId}).select(getUnSelectData(unSelect)).lean()
}

const switchDiscount = async ({shopId, code, active}) => {
    const query = {
        shopId,
        code
    }, update = {
        isActive: active
    }
    return await discountDB.updateOne({query,update})
}

const getCodeByShopIdAndCode = async ({shopId,code}) => {
    return await discountDB.findOne({
        shopId,
        code
    }).select(getUnSelectData(unSelect)).lean()
}

const getCodeByShopIdAndId = async ({shopId,discountId}) => {
    return await discountDB.findOne({
        shopId,
        _id:discountId
    }).select(getUnSelectData(unSelect)).lean()
}

const geDiscountByListShop = async ({code, shopIds}) => {
    return await discountDB.findOne({
        code,
        shopId: {$in: shopIds }
    }).lean()
}

const getListDiscountByListCode = async (codes) => {
    return await discountDB.find({code: {$in: codes}}).select(getUnSelectData(unSelect)).lean()
}

module.exports = {
    listDiscountByProductId,
    listDiscountByShopId,
    getCodeDetail,
    switchDiscount,
    getCodeByShopIdAndCode,
    geDiscountByListShop,
    getListDiscountByListCode,
    getCodeByShopIdAndId
}

