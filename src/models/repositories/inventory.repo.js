const { convertToObjectId } = require('../../utils/functions')
const {inventoryDB} = require('../inventory.model')
const { findProductById } = require('../repositories/product.repo')

const getInventoryById = async (id) => {
    return await inventoryDB.findById(id).lean()
}

const getInventoryByProductId = async (pid) => {
    return await inventoryDB.findOne({productId:pid}).lean()
}

const updateInventory = async (query,payload,options = {new: true}) => {
   const inventory = await inventoryDB.findOneAndUpdate(query,payload,options)
   return inventory.toObject()
}

const getListInventoryByShop = async (shopId) => {
    return await inventoryDB.find({shopId: convertToObjectId(shopId)}).lean()
}

const checkInventoryAvailability = async (products) => {
    const insufficientProducts = await inventoryDB.find({
        $or: products.map(p => ({
            productId: p.productId,
            stock: { $lt: p.quantity }
        }))
    }).select("productId stock").lean();

    // console.log()

    let productOutStock
    if (insufficientProducts.length) {
        productOutStock = await findProductById(insufficientProducts[0].productId)
    }

    // const productOutStock = await findProductById(insufficientProducts[0].productId)

    return {
        isAvailable: insufficientProducts.length === 0,
        insufficientProduct: productOutStock
    };
};


const reservationInventory = async (productId,quantity) => {
    const inventory = await inventoryDB.findOne({ productId }).lean();

    const query = {
        productId,
        stock: { $gte:quantity}
    }, update = {
        $push: {
            history: {
                oldStock: inventory.stock,
                reason: 'Order',
                action: 'export',
                quantity,
                date: new Date()
            }
        },
        $inc: {stock: -quantity, sold:+quantity},
    }

    if (inventory.stock <= inventory.lowStockThreshold) {
        update.status = 'low stock'
    }

    return await inventoryDB.findOneAndUpdate(query,update)
}

module.exports = {
    getInventoryById,
    getInventoryByProductId,
    updateInventory,
    getListInventoryByShop,
    checkInventoryAvailability,
    reservationInventory
}


