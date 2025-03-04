const { cartDB } = require('../cart.model')

const getCardByUserId = async (userId) => {
    return await cartDB.findOne({userId}).lean()
}

const checkProductInCart = async (userId, productId) => {
    return await cartDB.findOne({
        userId, "items.productId": productId
    }).lean()
}

const getCartById = async (cartId) => {
    return await cartDB.findById(cartId).lean()
}

module.exports = {
    getCardByUserId,
    checkProductInCart,
    getCartById
}