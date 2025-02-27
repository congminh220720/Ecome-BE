"use strict";

const { shopDB } = require("../shop.model");
const { shopFollowersDB } = require('../shopFollowers.model')


const removeFiledNotNeedShop = (shop) => {
  delete shop.staffs
  delete shop.oldThumbs
  delete shop.oldLogos
  delete shop.__v

  return {...shop}
}

const getShopByUserId = async (userId) => {
  return await shopDB.findOne({ ownerId: userId }).lean();
};

const getShopById = async (shopId) => {
  const shop = await shopDB.findById(shopId).lean()
  return removeFiledNotNeedShop(shop)
}

const getShopByIdToCheck = async (shopId) => {
  return await shopDB.findById(shopId).select('ownerId staffs').lean()
}

const getListShop = async ({ filter, skip, limit }) => {
  const shops = await shopDB
    .find(filter)
    .skip(skip)
    .limit(limit)
    .sort({ createdOn: -1 })
    .lean()

  const totalShops = await shopDB.countDocuments(filter);
  return {
    data: shops.map(shop => removeFiledNotNeedShop(shop)),
    pagination: {
      page: filter.page,
      limit:filter.limit,
      totalShops,
      totalPages: Math.ceil(totalShops / limit),
    },
  };
}

const searchShop = async (search) => {
    const shops = await shopDB
    .find({shopName :{ $regex: search, $options: 'i' }})
    .sort({ createdOn: -1 })
    .lean()
    return shops.map(shop => removeFiledNotNeedShop(shop))
}

const findFollowers = async (shopId) => {
    return await shopFollowersDB.findOne({shopId}).lean()
}

const addFollowerCount = async (shopId) => {
    return await shopDB.findByIdAndUpdate({_id: shopId}, { $inc: {followCount: 1}})
}

const subtractFollowerCount = async (shopId) => {
    return await shopDB.findByIdAndUpdate({_id: shopId}, { $inc: {followCount: -1}})
}

const findShopByIdAndUserId = async (id,ownerId) => {
  return await shopDB.findOne({_id:id, ownerId:ownerId}).lean()
}

const getShopWithStaff = async (shopId, userId) => {
      const shop = await shopDB.findOne({ _id: shopId, "staffs.userId": userId }).lean();
      return !!shop;
}


module.exports = {
  getShopByUserId,
  getShopById,
  searchShop,
  getListShop,
  findFollowers,
  addFollowerCount,
  subtractFollowerCount,
  removeFiledNotNeedShop,
  findShopByIdAndUserId,
  getShopByIdToCheck,
  getShopWithStaff
}
