const { convertToObjectId } = require('../../utils/functions')
const {inventoryDB} = require('../inventory.model')

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

module.exports = {
    getInventoryById,
    getInventoryByProductId,
    updateInventory,
    getListInventoryByShop
}


