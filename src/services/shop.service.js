'use strict'

const { shopDB } = require('../models/shop.model')
const { userDB } = require('../models/user.model')
const { shopFollowersDB } = require('../models/shopFollowers.model')
const { userFollowShopDB } = require('../models/userFollowShop.model')
const { convertToObjectId, removeUndefinedObject, isImageUrl, validateEmail } = require('../utils/functions')
const { 
        getShopByUserId, 
        getShopById, 
        getListShop, 
        searchShop, 
        addFollowerCount, 
        subtractFollowerCount, 
        removeFiledNotNeedShop, 
        findShopByIdAndUserId,
        findFollowers,
        getMyShop,
        listShopContributor
    } = require('../models/repositories/shop.repo')
const { addFollowShopCount, subtractFollowShopCount, getUserById } = require('../models/repositories/user.repo')

const { BadRequestError } = require('../core/error.response')
const { SHOP_MANAGER, SHOP_COLLABORATOR, MAX_STAFF } = require('../utils/constants')


// CREATE SHOP -> POST (shopName, thumbs, address, logo, description)
// UPDATE SHOP -> PATCH (shopName, thumbs, address, logo, description) (admin & staff (thumbs, desc))
// LIST SHOP ALL -> GET
// LIST SHOP BY ID -> GET (shopId)
// add staff -> POST (name, userId, role)
// searchShop -> GET (shopName)
// get staff -> get (shopId)
// update staff -> PATCH (userId, role, isActive, name)
// follow shop -> POST {shopId, userId}
// unFollow shop -> PATCH {shopId, userId}

class ShopService {
    static async registerShop (userId,{shopName, thumb, address, logo, description, email}) {
        const user = await getUserById(userId)
        if (!user) throw new BadRequestError('User not found')

        // tim shop co ton tai k

        const shopExists = await getShopByUserId(convertToObjectId(userId))
        if (shopExists) throw new BadRequestError('You can only create one shop')

        let newShop = {
            shopName, thumb, address, logo, description, email
        }   
        
        newShop = removeUndefinedObject(newShop)

        if (thumb) {
            if (!isImageUrl(thumb)) throw new BadRequestError(`[${thumb}] invalid picture`)
        }

        if (logo) {
            if (!isImageUrl(logo)) throw new BadRequestError(`Invalid Logo`)
        }

        if (!validateEmail(newShop.email)) throw new BadRequestError(`Invalid Email`) 

        newShop.ownerId = user._id

        let shop = await shopDB.create(newShop)
        shop = shop.toObject(shop)
        shop._id = shop._id.toString()
        await shopFollowersDB.create({shopId: convertToObjectId(shop._id)})
        return removeFiledNotNeedShop(shop)
    }

    static async updateShop (shopId, userId,{shopName, thumb, address, logo, description, email}) {
        const user = await getUserById(userId)
        if (!user) throw new BadRequestError('User not found')
        
        const shop = await findShopByIdAndUserId(shopId,convertToObjectId(userId))
        if (!shop) throw new BadRequestError('You are not the shop owner')

        if (thumb) {
            if (!isImageUrl(thumb)) throw new BadRequestError(`[imgUrl] invalid picture`)
        }

        if (logo) {
            if (!isImageUrl(logo)) throw new BadRequestError(`Invalid Logo`)
        }   

        let shopUpdate = {
            shopName, thumb, address, logo, description, email
        }   
        
        const query = {
            _id: shopId
        } 
        shopUpdate = removeUndefinedObject(shopUpdate) 


       let result = await shopDB.findByIdAndUpdate(query,shopUpdate, {new: true})
       result = result.toObject()
       return removeFiledNotNeedShop(result)
    }

    static async getShops ({ page = 1, limit = 10, search }) {
        const filter = {
            status: 'active',
            verify: true
        }
        if (search) {
            filter.shopName = { $regex: search, $options: 'i' }
        }
        const skip = (page - 1) * limit
    
        return await getListShop({ filter, skip, limit })
    }

    static async getShopDetail (shopId) {
        return await getShopById(shopId)
    }

    static async searchShop (search) {
        return await searchShop(search)
    }

    static async addStaff (ownerId, shopId, {userId,role}) {
        const shop = await findShopByIdAndUserId(shopId,convertToObjectId(ownerId))
        if (!shop) throw new BadRequestError('You are not the shop owner')

        const user = await getUserById(userId)
        if (!user) throw new BadRequestError('User not found')
            
        const staffs = shop.staffs
        const activeStaffs = staffs.filter(staff => staff.isActive)

        const userIsStaff = staffs.find(staff => staff.userId.toString() === userId)

        if (userIsStaff) throw new BadRequestError('This user is become staff of this shop')

        if (activeStaffs.length >= MAX_STAFF) throw new BadRequestError('Full slot for this shop')

        if (![SHOP_MANAGER, SHOP_COLLABORATOR ].includes(role)) throw new BadRequestError('Invalid staff role')
        
        let staff = {
            userId: convertToObjectId(userId),
            nickName: user.name,
            role
        }, update = {
            $push: { staffs: staff },
            $inc : {staffCount: 1 },
        }, userContributor = {
            $inc : {contributorCount: 1 },
            $push: {
                contributors: {
                    shopId: convertToObjectId(shopId),
                    role
                }
            }
        }, options = {
            new: true
        }
        
        let newStaff = await shopDB.findByIdAndUpdate({_id: shopId},update,options)
        await userDB.findByIdAndUpdate({_id: userId},userContributor,options)
        return newStaff.toObject().staffs 
    }

    static async updateStaff (ownerId,shopId, {userId,role,nickName, isActive}) {
        const shop = await findShopByIdAndUserId(shopId,convertToObjectId(ownerId))
        if (!shop) throw new BadRequestError('You are not the shop owner')

        const user = await getUserById(userId)
        if (!user) throw new BadRequestError('User not found')

        let staffUpdate = {role,nickName, isActive}
        staffUpdate = removeUndefinedObject(staffUpdate) 

        const staffs = shop.staffs 

        const userIsStaff = staffs.find(staff => staff.userId.toString() === userId)

        if (!userIsStaff) throw new BadRequestError('This user not staff of this shop')

        const staff = {}

        for (const key in staffUpdate) {
            staff[`staffs.$.${key}`] = staffUpdate[key];
        }
        staff["staffs.$.modifiedOn"] = new Date()

        await shopDB.updateOne(
            { _id: shopId, "staffs.userId": userId },  
            { $set:staff}
        )

        const contributor = {}

        if (staffUpdate.nickName) delete staffUpdate.nickName
        for (const key in staffUpdate) {
            contributor[`contributors.$.${key}`] = staffUpdate[key];
        }
        contributor["contributors.$.modifiedOn"] = new Date()
        console.log(contributor)
        await userDB.updateOne(
            { _id: userId, "contributors.shopId": shopId },  
            { $set: contributor}
        )

        return {}
    }

    static async getStaff(shopId) {
        const shop = await getShopByIdToCheck(shopId);
        if (!shop) throw new BadRequestError("Shop not found");
    
        const staffDetails = await Promise.all(
            shop.staffs.map(async (staff) => {
                const user = await getUserById(staff.userId.toString());
                return {
                    ...staff,
                    name: user.name,
                    avatar: user.avatar,
                    email: user.email,
                };
            })
        );
    
        return staffDetails;
    }
    
    
    static async followShop (userId, {shopId}) {
        const shop = await getShopByIdToCheck(shopId) 
        if (!shop) throw new BadRequestError('Shop not found')

        const user = await getUserById(userId)
        if (!user) throw new BadRequestError('User not found')

        const userIdConverted =  convertToObjectId(userId)
        const shopIdConverted =  convertToObjectId(shopId)

        const shopFollowers = await findFollowers(convertToObjectId(shopId))

        if (shopFollowers.followers.some(follower => follower.toString() === userId)) throw new BadRequestError('You have followed this shop')
        const query = {
            shopId: shopIdConverted
        }, update = {
            $push: {followers: {userId:userIdConverted }}
        }
        await shopFollowersDB.findOneAndUpdate(query,update)  
        await userFollowShopDB.findOneAndUpdate({userId:userIdConverted},{$push: {listShopFollow: {shopId:shopIdConverted}}})
        await addFollowerCount(shopId)
        await addFollowShopCount(userId)
        return {}
    }

    static async unFollowShop (userId, {shopId}) {
        const shop = await getShopByIdToCheck(shopId) 
        if (!shop) throw new BadRequestError('Shop not found')

        const user = await getUserById(userId)
        if (!user) throw new BadRequestError('User not found')

        const userIdConverted =  convertToObjectId(userId)
        const shopIdConverted =  convertToObjectId(shopId)

        const shopFollowers = await findFollowers(convertToObjectId(shopId))

        if (!shopFollowers.followers.some(follower => follower.userId.toString() === userId)) throw new BadRequestError('You have not followed this shop')
        const query = {
            shopId: shopIdConverted
        }, update = {
            $pull: {followers: {userId:userIdConverted }}
        }

        await shopFollowersDB.findOneAndUpdate(query,update)  
        await userFollowShopDB.findOneAndUpdate({userId:userIdConverted},{$pull: {listShopFollow:  {shopId:shopIdConverted }}})
        await subtractFollowerCount(shopId)
        await subtractFollowShopCount(userId)
        return {}
    }

    static async listMyShop (userId) {
        return await getMyShop(convertToObjectId(userId))
    }

    static async listShopContributor (userId) {
        return await listShopContributor(convertToObjectId(userId))
    }

    static async deleteShop (shopId) {
        // update later 
        // check order when delete
    }
}


module.exports = ShopService