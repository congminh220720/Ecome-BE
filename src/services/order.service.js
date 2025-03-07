'use strict'
const DiscountService = require('./discount.service')
const CartService = require('./cart.service')
const { orderDB, OrderGroupDB} = require('../models/order.model')
const { BadRequestError } = require('../core/error.response')
const { getUserById } = require('../models/repositories/user.repo')
const { getCartById } = require('../models/repositories/cart.repo')
const { getListDiscountByListCode } = require('../models/repositories/discount.repo') 
const { getOrderGroupById, getChildrenOrderByOrderGroupId, getOrderById, getShopOrders, getShopsOrderByStatus, getOrderGroupByUserId, getOrderGroupByIdAndStatus } = require('../models/repositories/order.repo') 

const { convertToObjectId } = require('../utils/functions')
const { getAddressById } = require('../models/repositories/address.repo')
const { getShopByUserId } = require('../models/repositories/shop.repo')
const { getUrlProductById } = require('../models/repositories/product.repo')
const { checkInventoryAvailability } = require('../models/repositories/inventory.repo')
const { pessimisticProductInventory, releaseLock } = require('./redis/checkout/pessimisticLocking.redis')

const { ORDER_STATUS_VERIFIED,PAYMENT_METHOD_COP , PAYMENT_METHODS, ORDER_STATUS_PENDING,PAYMENT_STATUS_UNPAID,PAYMENT_STATUS_PAID, ORDER_STATUS_CANCEL, PAYMENT_STATUS_VERIFIED} = require('../utils/constants')
class OrderService {
    static async createOrder (userId,{cartId, addressId, paymentMethod, note = '', discounts = []}) {
        const createdOn = new Date();
        const expectedDeliveryDate = new Date();
        expectedDeliveryDate.setDate(createdOn.getDate() + 3)

        const user = await getUserById(userId)
        if (!user) throw new BadRequestError('User not found')

        let cart = await getCartById(cartId)
        if (!cart) throw new BadRequestError('cart not found')

        if (cart.items.length == 0) throw new BadRequestError('Your cart don\'t have any item')

        if (!PAYMENT_METHODS.includes(paymentMethod)) throw new BadRequestError('Invalid payment method')
         
        let orders = []
        let listDiscountApply = []
        if (discounts.length) {
            const listDiscount = await getListDiscountByListCode(discounts)
            const listCode = listDiscount.map(e => e.code)

            for (let i = 0; i < discounts.length; i++) {
                const code = discounts[i]
                if (!listCode.includes(code)) throw new BadRequestError(`code ${code} is not exists`)
                const discount = listDiscount.find(e => e.code === code)
                const useDiscount = await DiscountService.checkDiscountForServer(userId, {cart,code})
    
                cart = useDiscount.cart
                listDiscountApply.push({
                    shopId: convertToObjectId(discount.shopId),
                    code,
                    discountAmount: useDiscount.discountAmount
                })
    
                cart.items.forEach(e => {
                    orders.push({
                        userId: convertToObjectId(userId),
                        shopId: e.shopId,
                        productId: e.productId,
                        quantity: e.quantity,
                        price: e.price,
                        discount: e.discount ? {
                            code: code,
                            discount: e.discount
                        } : {}
                    })
                })
            }
        } else {
            cart.items.forEach(e => {
                orders.push({
                    userId: convertToObjectId(userId),
                    shopId: convertToObjectId(discount.shopId),
                    productId: e.productId,
                    quantity: e.quantity,
                    price: e.price,
                }
            )})
        }

        const resultCheckingStock = await checkInventoryAvailability(orders)

        if (!resultCheckingStock.isAvailable) {
            const { insufficientProducts } = resultCheckingStock
            throw new BadRequestError(`${insufficientProducts.productName} is out of stock`)
        }

        const acquireProduct = []
        for (let i = 0; i < orders.length; i++) {
            const order = orders[i]
            const keyLock = await pessimisticProductInventory(order.productId, order.quantity)
            if (keyLock) {
                await releaseLock(keyLock)
            }
        }

        if (acquireProduct.includes(false)) {
            throw new BadRequestError('Some product be changed let you update again please')
        }

        const groupOrder = {
            userId: convertToObjectId(userId),
            orders: [],
            totalPrice: cart.totalPrice,
            paymentMethod,
            expectedDeliveryDate,
            note,
            createdOn,
            listDiscountApply: listDiscountApply.length ? listDiscountApply : [],
        }
            
    
        if (paymentMethod !== PAYMENT_METHOD_COP) {
            let userAddress =  await getAddressById(addressId)
            if (!userAddress) throw new BadRequestError('Your address invalid')
            groupOrder.shippingAddress = {
                street: userAddress.addressLine1,
                city: userAddress.city,
                state: userAddress.state,
                country: userAddress.country,
                postalCode: userAddress.postalCode
            }
        }

        let newGroupOrder = await OrderGroupDB.create(groupOrder)
        newGroupOrder = newGroupOrder.toObject()

        const createdOrders = await Promise.all(orders.map(o =>  orderDB.create({...o, orderGroupId:convertToObjectId(newGroupOrder._id)})))
        const orderIds = createdOrders.map(orders => orders._id);
        const updateOrderGroup = await OrderGroupDB.findOneAndUpdate({_id: newGroupOrder._id }, {$set: {orders: orderIds}}, {new: true})
        await CartService.cleanCart(userId)
        return updateOrderGroup.toObject()
    }

    static async paymentOrder (userId, {orderGroupId,paymentDetails}) {
       if (!await getUserById(userId)) throw new BadRequestError('user not found')

        const orderGroup = await getOrderGroupById(orderGroupId)
        if (!orderGroup) throw new BadRequestError('Order not found')

        if (orderGroup.status !== ORDER_STATUS_PENDING) throw new BadRequestError('order had paid or verify maybe cancel')

        if (orderGroup.paymentStatus !== PAYMENT_STATUS_UNPAID) throw new BadRequestError('order had paid or cancel')

        const query = {
            _id: orderGroupId
        }, update = {
            paymentStatus: PAYMENT_STATUS_PAID,
            paymentDetails
        }, options = {
            new: true
        }
        const selectData = ['_id','status']    
        const orders = await getChildrenOrderByOrderGroupId(orderGroupId,selectData)

        const orderGroupUpdate = await OrderGroupDB.findOneAndUpdate(query, update, options)

        await Promise.all(orders.map( async order => {
            return await orderDB.findOneAndUpdate({_id:order._id},{paymentStatus: PAYMENT_STATUS_PAID})
        }))

        return orderGroupUpdate.toObject()
    }

    static async listOrderByStatus(userId, status) {
        if (!await getUserById(userId)) throw new BadRequestError('User not found')
        
        const ordersGroup = await getOrderGroupByIdAndStatus(userId, status)
        if (!ordersGroup.length) throw new BadRequestError("You don't have any orders")
    
        const selectData = ['_id', 'status', 'productId', 'quantity', 'price', 'discount']
        const ordersGroupMapWithOrderChildren = await Promise.all(
            ordersGroup.map(async (orderGroup) => {
                const orders = await getChildrenOrderByOrderGroupId(orderGroup._id, selectData)
    
                const ordersWithImages = await Promise.all(
                    orders.map(async (order) => ({
                        ...order,
                        adsPicture: await getUrlProductById(order.productId)
                    }))
                )
    
                return {
                    ...orderGroup,
                    orders: ordersWithImages
                }
            })
        )
    
        return ordersGroupMapWithOrderChildren;
    }
    

    static async listMyOrder (userId) {// get by date -> update later
        if (!await getUserById(userId)) throw new BadRequestError('User not found')
        
            const ordersGroup = await getOrderGroupByUserId(userId)
            if (!ordersGroup.length) throw new BadRequestError("You don't have any orders")
        
            const selectData = ['_id', 'status', 'productId', 'quantity', 'price', 'discount']
            const ordersGroupMapWithOrderChildren = await Promise.all(
                ordersGroup.map(async (orderGroup) => {
                    const orders = await getChildrenOrderByOrderGroupId(orderGroup._id, selectData)
        
                    const ordersWithImages = await Promise.all(
                        orders.map(async (order) => ({
                            ...order,
                            adsPicture: await getUrlProductById(order.productId)
                        }))
                    )
        
                    return {
                        ...orderGroup,
                        orders: ordersWithImages
                    }
                })
            )
            return ordersGroupMapWithOrderChildren;
    }

    static async cancelOrder (userId, orderGroupId) {
        if (!await getUserById(userId)) throw new BadRequestError('user not found')

        const orderGroup = await getOrderGroupById(orderGroupId)
        if (!orderGroup) throw new BadRequestError('Order not found')

        if (orderGroup.status !== ORDER_STATUS_PENDING) throw new BadRequestError('order had paid or verify maybe canceled')

        if (orderGroup.paymentStatus !== PAYMENT_STATUS_UNPAID) throw new BadRequestError('order had paid or canceled')

        const selectData = ['_id','status']    
        const orders = await getChildrenOrderByOrderGroupId(orderGroupId,selectData)

        const query = {
            _id: orderGroupId
        }, update = {
            status: ORDER_STATUS_CANCEL,
        }, options = {
            new: true
        }

        const orderGroupUpdate = await OrderGroupDB.findOneAndUpdate(query, update, options)

        await Promise.all(orders.map( async order => {
            return await orderDB.findOneAndUpdate({_id:order._id},update)
        }))
        
        return orderGroupUpdate.toObject()
    }

    static async returnOrder (userId, {orderId,reason}) {
        if (!await getUserById(userId)) throw new BadRequestError('user not found')
        
        const order = await getOrderById(orderId)
        if (!order) throw new BadRequestError('Order not found')

        if (reason === '') throw new BadRequestError('Let give us reason')
        
        if (order.status !== ORDER_STATUS_COMPLETED) throw new BadRequestError('Your order is shipping or canceled')

        const query = {
            _id: orderId
        }, update = {
            status: ORDER_STATUS_RETURN,
            returnRequest: {
                reason,
                processedAt: new Date()
            }
        }, options = {
            new: true
        }

        const returnOrder = await orderDB.findOneAndUpdate(query, update, options)
        return returnOrder.toObject()
    }

    // api for admin
    static async verifyOrder (userId,orderId) { 
        if (!await getShopByUserId(userId)) throw new BadRequestError('you are not shop owner')
        
        const order = await getOrderById(orderId)
        if (!order) throw new BadRequestError('Order not found')

        if (order.status !== ORDER_STATUS_PENDING) throw new BadRequestError('Invalid status')
        
        const query = {
            _id: orderId
        },update = {
            status: ORDER_STATUS_VERIFIED,
            paymentStatus: PAYMENT_STATUS_VERIFIED
        }

        await orderDB.findOneAndUpdate(query, update)
        return {}
    }

    static async cancelOrderByAdmin (userId,orderId) { 
        if (!await getShopByUserId(userId)) throw new BadRequestError('you are not shop owner')
        
        const order = await getOrderById(orderId)
        if (!order) throw new BadRequestError('Order not found')

        if (![ORDER_STATUS_VERIFIED,ORDER_STATUS_PENDING].includes(order.status)) throw new BadRequestError('Invalid status')
            const query = {
                _id: orderId
            },update = {
                status: ORDER_STATUS_CANCEL
            }

            /// send email late here -> reason cancel

            await orderDB.findOneAndUpdate(query, update)
            return {}
    }

    static async approveReturnOrder (userId,orderId) { 
        if (!await getShopByUserId(userId)) throw new BadRequestError('you are not shop owner')
        
        const order = await getOrderById(orderId)
        if (!order) throw new BadRequestError('Order not found')

        if (order.status !== ORDER_STATUS_RETURN) throw new BadRequestError('Invalid status')
        
        const query = {
            _id: orderId
        }, update = {
            status: ORDER_STATUS_RETURNED,
            returnRequest: {
                requested: true,
                approved: true
            }
        }

        await orderDB.findOneAndUpdate(query, update, options)
        return {}
    }

    static async listOrderStatusByShop (userId, shopId, status) {
        if (!await getShopByUserId(userId)) throw new BadRequestError('you are not shop owner')
        console.log(status)
        return await getShopsOrderByStatus(shopId,status)
    }

    static async listOrderByShop (userId,shopId) { // get by date -> update later
        if (!await getShopByUserId(userId)) throw new BadRequestError('you are not shop owner')
        return await getShopOrders(shopId)
    }
}


module.exports = OrderService