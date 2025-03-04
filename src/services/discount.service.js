'use strict'
const { discountDB } = require('../models/discount.model')
const { BadRequestError } = require('../core/error.response')
const { getUserById } = require('../models/repositories/user.repo')
const { listDiscountByProductId, listDiscountByShopId, getCodeDetail, geDiscountByListShop, getCodeByShopIdAndCode, switchDiscount } = require('../models/repositories/discount.repo')
const { findShopByIdAndUserId, getShopById } = require('../models/repositories/shop.repo')
const { getProductByListId } = require('../models/repositories/product.repo')
const { getCartById } = require('../models/repositories/cart.repo')
const { removeUndefinedObject, calculatePercentage } = require('../utils/functions')
const {  DISCOUNT_FIXED_AMOUNT,DISCOUNT_APPLY_ALL,DISCOUNT_APPLY_SPECIFIC, DISCOUNT_PERCENT} = require('../utils/constants')


/*
    -> create discount {name, description, code, type, value, maxValue, startDay, endDay, maxUse, minOrderValue, maxUserPerUse, productIds =[], shopId, isActive = true, applies }
        check codeName is exists -> query by shopId,
    -> Update discount {name, description, code, type, value, maxValue, startDay, endDay, maxUse, minOrderValue,maxUserPerUse, productIds =[],isActive,applies}
        check code name is exists yet ?,query by shopId, check Is active
    -> active discount -> check code name is exists yet ?
    -> inactive discount -> check code name is exists yet ?

    -> get list discount by shopId
    -> get discount by product id
    -> get discount detail by code id
    -> apply code 
        
*/


class DiscountService {
    static async createDiscount(userId, {name, description, code, type, value, maxValue, startDay, endDay, maxUse, minOrderValue, maxUserPerUse, productIds =[], shopId, isActive = true, applies }) {
        if (!await findShopByIdAndUserId(shopId, userId)) throw new BadRequestError('You are not admin this shop')
        if (await getCodeByShopIdAndCode({shopId,code})) throw new BadRequestError('This code is already exists !')
        
        
        if (new Date(startDay) > new Date(endDay)) {
            throw new BadRequestError('Start date must be before end date')
        }

        if (type === DISCOUNT_PERCENT) if (value > 100) throw new BadRequestError('Not greater than 100%')
    
        const newDiscount =  {name, description, code, type, value, maxValue, startDay, endDay, maxUse, minOrderValue, maxUserPerUse, productIds, shopId, isActive, applies }
        const discount = await discountDB.create(newDiscount)
        return discount.toObject()
    }

    static async updateDiscount(userId, shopId, {name, description, code, type, value, maxValue, startDay, endDay, maxUse, minOrderValue, maxUserPerUse, productIds, isActive, applies }) {
        if (!await findShopByIdAndUserId(shopId, userId)) throw new BadRequestError('You are not admin this shop')
        
        const discount = await getCodeByShopIdAndCode({shopId,code})
        if (!discount) throw new BadRequestError('This code is not exists !')
            
        if (startDay && endDay) {
            if (new Date(startDay) > new Date(endDay)) {
                throw new BadRequestError('Start date must be before end date')
            }
        }

        const discountClean = await removeUndefinedObject({name, description, code, type, value, maxValue, startDay, endDay, maxUse, minOrderValue, maxUserPerUse, productIds, isActive, applies })
        const query = {
            shopId: discount.shopId,
            code
        }, options = {
            new: true
        }

        const discountUpdate = await discountDB.findOneAndUpdate(query,discountClean,options)
        return discountUpdate.toObject()
    }


    static async activeDiscount(userId, {shopId, code}) {
        if (!await findShopByIdAndUserId(shopId, userId)) throw new BadRequestError('You are not admin this shop')
        return await switchDiscount({shopId, code, active: true})
    }

    static async inactiveDiscount(userId, {shopId, code}) {
        if (!await findShopByIdAndUserId(shopId, userId)) throw new BadRequestError('You are not admin this shop')
        return await switchDiscount({shopId, code, active: false})
    }

    static async listDiscountByProductId(productId) {
        return await listDiscountByProductId(productId)
    }

    static async getDiscountDetailByCode(code,shopId) {
        return await getCodeDetail(code,shopId)
    }

    static async listDiscountByShopId(shopId) {
        return await listDiscountByShopId(shopId)

    }

    static async applyDiscount(userId,{cartId, code}) {
        if (!await getUserById(userId)) throw new BadRequestError('User not found')
        const cart = await getCartById(cartId)

        const shopIds = cart.items.map(i => i.shopId)

        const discount = await geDiscountByListShop({code, shopIds})
        if (!discount.isActive) throw new BadRequestError('code is inactive')

        if (new Date(discount.startDay) > new Date()) throw new BadRequestError('Code not started yet !')   
        if (!new Date(discount.endDay) > new Date()) throw new BadRequestError('Code is expired')
        if (discount.useCount >= discount.maxUse) throw new BadRequestError('use out')

        const userUsedCount = discount.userUsed.filter(i => i.toString() === userId)
        if (userUsedCount >= discount.maxUserPerUse) throw new BadRequestError(`You just use ${discount.maxUserPerUse} for this code`)

        const itemByShopId = cart.items.filter(i => i.shopId.toString() === discount.shopId.toString())

        const productIds = itemByShopId.map(i => i.productId)
        const select = ['productName', 'price', '_id']

        const productIdsByCart = await getProductByListId(productIds,select)

        // update price of product if that product be updated
        const newItems = cart.items.map(i => {
            const product = productIdsByCart.find(p => p._id.toString() === i.productId);
            return product ? { ...i, price: product.price } : i;
        });


        let totalPriceForProductOfShop = newItems.reduce((total, i) => total + (i.price * i.quantity), 0)
        if (!totalPriceForProductOfShop > discount.minOrderValue) {
            const shop = await getShopById(discount.shopId)
            throw new BadRequestError(`min value for product of shop' ${shop.shopName}`)
        }

        // let totalValueDiscount = 0

        // if (discount.applies === DISCOUNT_APPLY_ALL) {
        //     if (discount.type === DISCOUNT_FIXED_AMOUNT) {
        //         totalValueDiscount = totalPriceForProductOfShop - discount.value
        //     } else {
        //         totalValueDiscount = calculatePercentage(totalPriceForProductOfShop,discount.value) 
        //     }
        // } else {
        //     if (discount.type === DISCOUNT_FIXED_AMOUNT) {
        //         totalValueDiscount = productIdsByCart.price - discount.value
        //     } else {
        //         totalValueDiscount = calculatePercentage(productIdsByCart.price,discount.value) 
        //     }
        // }

        // // update price of product if that product be updated
        // const newItems = cart.items.map(i => {
        //     if (productIds.includes(i.productId)) return {
        //         ...i,
        //         price: productIdsByCart.find(i => i._id.toString === i.productId).price
        //     } 
        //     return i
        // })


        // new version
        let totalValueDiscount = 0
        const discountBaseValue = discount.applies === DISCOUNT_APPLY_ALL ? totalPriceForProductOfShop : productIdsByCart.price;
     
        totalValueDiscount = discount.type === DISCOUNT_FIXED_AMOUNT ? discountBaseValue - discount.value : calculatePercentage(discountBaseValue, discount.value)
        totalValueDiscount = totalValueDiscount > discount.maxValue ? discount.maxValue : totalValueDiscount

        return {
            cart: {
                ...cart,
                items: newItems,
                totalPrice: cart.totalPrice - totalValueDiscount 
            },
            discountAmount: totalValueDiscount
        }
    }
}


module.exports = DiscountService