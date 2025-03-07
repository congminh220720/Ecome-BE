'use strict'
const { BadRequestError } = require('../core/error.response')
const { cartDB } = require('../models/cart.model')
const { getUserById } = require('../models/repositories/user.repo')
const { getCardByUserId, checkProductInCart } = require('../models/repositories/cart.repo')
const  { findProductById } = require('../models/repositories/product.repo')
const { convertToObjectId } = require('../utils/functions')
const { getInventoryByProductId } = require('../models/repositories/inventory.repo')
// cart structure 
/*
    {
        _id:
        items: [
            {
                shopId
                productId
                quantity
                price
            },
            {
                shopId
                productId
                quantity
                price
            }
        ]
        totalPrice: 
    }

*/

class CartService {
    static async createCart (userId, {shopId,productId,quantity,price}) {
        const cart = await getCardByUserId(userId)
        const objectProductId = convertToObjectId(productId)
        if (!await getUserById(userId)) throw new BadRequestError('User is not exists')
        // if (await getCardByUserId(userId)) throw new BadRequestError('Cart is already exists')
        
        const product = await findProductById(objectProductId)
        if(!product) throw new BadRequestError('Product not found')    
        
        const inventory = await getInventoryByProductId(objectProductId)
        if (!inventory || !inventory.stock) throw new BadRequestError(`Product ${product.productName} is out of stock`)
        
        if (quantity > inventory.stock) throw new BadRequestError(`Just only ${inventory.stock} product`)
        
        if (price !== product.price) throw new BadRequestError('Invalid price')

        let newTotalPrice = price * quantity;

        if (cart) {
            newTotalPrice = cart.items.reduce((total, item) => total + item.price * item.quantity, 0);
            newTotalPrice += price * quantity;
        }
            
        const query = {
            userId
        }, update = {
            userId: convertToObjectId(userId),
            totalPrice: newTotalPrice,
            $push: { items: {
                shopId: convertToObjectId(shopId),
                productId: convertToObjectId(productId),
                quantity,
                price
            }}
        }, options = {
            new: true,
            upsert: true
        }    
        
        const newCard = await cartDB.findOneAndUpdate(query,update,options)
        return newCard.toObject()
    }

    static async cleanCart(userId) {
        if (!await getCardByUserId(userId)) throw new BadRequestError('Cart is not exists')

        const query = {
            userId: convertToObjectId(userId)
        }, update = {
            $set: { items: []},
            totalPrice: 0
        }, options = {
            new: true,
        }  

        const newCart = await cartDB.findOneAndUpdate(query,update,options)
        return newCart ? newCart.toObject() : null
    }

    static async addProductToCard (userId,{shopId,productId,quantity,price}) {
        const cart = await getCardByUserId(userId)
        if (!cart) CartService.createCart(userId,{shopId,productId,quantity,price})
        
        const product = await findProductById(productId)
        if(!product) throw new BadRequestError('Product not found')  
        
        if (price !== product.price) throw new BadRequestError('Invalid price')
  
        const productMatch = cart.items.find(i => i.productId.toString() === productId)
        
        if (!productMatch) CartService.createCart(userId,{shopId,productId,quantity,price})

      
        let newTotalPrice = cart.items.reduce((total, item) => total + item.price * item.quantity, 0);
        newTotalPrice += price * quantity;
         
        
        const query = {
            userId, "items.productId": productId
        }, update = {
            $inc: { "items.$.quantity": quantity },
            totalPrice: newTotalPrice,
        }, options = {
            new: true
        }
           
        let newCart = await cartDB.findOneAndUpdate(query,update,options)
        newCart = newCart.toObject()
        return newCart
        
    }

    static async removeProductInCard(userId,productId) {
        const cart = await getCardByUserId(userId)
        if (!cart) CartService.createCart(userId,{shopId,productId,quantity,price})
        
        const product = await findProductById(productId)
        if(!product) throw new BadRequestError('Product not found') 
        
        if (!await checkProductInCart(userId,productId)) throw new BadRequestError('This product is not exists in cart')

        const newCart = await cartDB.findOneAndUpdate(
            { userId },
            { $pull: { items: { productId: productId }}},
            { new: true}
        )

        const newTotalPrice = newCart.items.reduce((total, item) => total + item.price * item.quantity, 0);

        newCart.totalPrice = newTotalPrice;
        await newCart.save() 

        return newCart.toObject()        
    }

    static async subtractQuantityProduct (userId,{productId,quantity}) {
        const cart = await getCardByUserId(userId)
        if (!cart) CartService.createCart(userId,{shopId,productId,quantity,price})
        
        const product = await findProductById(productId)
        if(!product) throw new BadRequestError('Product not found') 
        
        if (!await checkProductInCart(userId,productId)) throw new BadRequestError('This product is not exists in cart')
        
        const query = {
            userId, "items.productId": productId
        }, update = {
            $inc: { "items.$.quantity": -quantity }
        }, options = {
            new: true
        }
            
        let newCart = await cartDB.findOneAndUpdate(query,update,options)
        newCart = newCart.toObject()

        let newTotalPrice = newCart.items.reduce((total, item) => total + item.price * item.quantity, 0);

        let updateCart = await cartDB.findOneAndUpdate(query,{totalPrice: newTotalPrice},options)
        return updateCart.toObject()
    }

    static async getCart (userId)  {
        return await getCardByUserId(userId)
    }
}

module.exports = CartService