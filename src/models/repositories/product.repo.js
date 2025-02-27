'use strict'

const { convertToObjectId } = require('../../utils/functions')
const { productDB } = require('../product.model')
const { getUnSelectData, getSelectData } = require('../../utils/functions')
const queryProduct = async ({query,limit,skip}) => {
    return await productDB.find(query)
    // .populate('shopId', 'shopName email _id')
    .sort({updateAt: -1})
    .skip(skip)
    .limit(limit)
    .lean()
    .exec()
}

const findProductById = async (productId) => {
    return await productDB.findById(productId).lean()
}

const updateProductById = async (productId, payload, model, isNew) => {
    return await model.findByIdAndUpdate(productId, payload, {new: isNew})
}

const publishProductByShop = async({shopId, productId}) => {
    const foundShop = await productDB.findOne({
        shopId: convertToObjectId(shopId),
        _id: convertToObjectId(productId),
    })

    if (!foundShop) return null 
    foundShop.isDraft = false
    foundShop.isPublished = true 
    const { modifiedCount } = await foundShop.updateOne(foundShop)

    return modifiedCount
}

const unPublishProductByShop = async({shopId, productId}) => {
    const foundShop = await productDB.findOne({
        shopId: convertToObjectId(shopId),
        _id: convertToObjectId(productId),
    })

    if (!foundShop) return null 

    foundShop.isDraft = false
    foundShop.isPublished = false 
    const { modifiedCount } = await foundShop.updateOne(foundShop)
    return modifiedCount
}

const findAllDraftsForShop = async ({query,limit,skip}) => {
    return await queryProduct({query,limit,skip})
}

const findAllPublishForShop = async ({query,limit,skip}) => {
    return await queryProduct({query,limit,skip})
}

const searchProductByUser = async ({keySearch}) => {
    // const regexSearch = new RegExp(keySearch)
    // const results = await productDB.find({
    //     isPublished: true,
    //     $text: {$search: regexSearch}
    // }, {score: {$meta: 'textScore'}})
    // .sort({score: {$meta: 'textScore'}}).lean()
    // return results

    return await productDB
    .find({productName :{ $regex: keySearch, $options: 'i' }, isPublished: true })
    .sort({ createdOn: -1 })
    .lean()
}

const findAllProducts = async ({limit, sort, page, filter,select}) => {
    const skip = (page - 1) * limit
    const sortBy = sort === 'ctime' ? {_id: -1} : {_id: 1}
    const products = await productDB.find(filter)
    .sort(sortBy)
    .skip(skip)
    .limit(limit)
    .select(getSelectData(select))
    .lean()

    return products
}

const findProduct = async ({ productId, unSelect }) => {
    return await productDB.findById(productId).select(getUnSelectData(unSelect))
}

module.exports = {
    updateProductById,
    findProductById,
    publishProductByShop,
    unPublishProductByShop,
    findAllDraftsForShop,
    findAllPublishForShop,
    searchProductByUser,
    findAllProducts,
    findProduct,
}