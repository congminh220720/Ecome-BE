"use strict";

const {
  productDB,
  productElectronicDB,
  productClothingDB,
  productFurnitureDB,
} = require("../models/product.model");
const { BadRequestError } = require("../core/error.response");
const inventoryService = require("../services/inventory.service");
const slugify = require('slugify')

const { getShopByIdToCheck } = require("../models/repositories/shop.repo");
const {
  publishProductByShop,
  unPublishProductByShop,
  findAllDraftsForShop,
  findAllPublishForShop,
  searchProductByUser,
  findAllProducts,
  findProduct,
  updateProductById,
  findProductById,
} = require("../models/repositories/product.repo");
const {
  convertToObjectId,
  removeUndefinedObject,
  isImageUrl,
  updateNestedObjectParser,
} = require("../utils/functions");

// ! Apply design pattern Factory method

// createProduct
// updateProduct
//  -> unPublicProduct
//  -> publicProduct
//
// getAllProductDraft
// getAllProductPublic
// getAllProductUnPublic
// getAllProduct
// searchProduct
// getProductDetail

// removeProduct

class ProductFactory {
  static productRegistry = {};
  static registerProductType(type, classRef) {
    ProductFactory.productRegistry[type] = classRef;
  }

  static async createProduct(userId, type, payload) {
    const productClass = ProductFactory.productRegistry[type];
    if (!productClass) throw new BadRequestError("Invalid Product type");

    return new productClass(payload).createProduct(userId);
  }

  // Update
  static async publishProductByShop(shopId, productId ) {
    return await publishProductByShop({ shopId, productId });
  }

  static async unPublishProductByShop( shopId, productId ) {
    return await unPublishProductByShop({ shopId, productId });
  }

  static async updateProduct(type, productId, userId, payload) {
    const productClass = ProductFactory.productRegistry[type];
    if (!productClass) throw new BadRequestError("Invalid Product type");
    return new productClass(payload).updateProduct(userId, productId);
  }

  // GET
  static async findAllDraftsForShop({ shopId, limit = 50, skip = 0 }) {
    const query = { shopId, isDraft: true };
    return await findAllDraftsForShop({ query, limit, skip });
  }

  static async findAllPublishForShop({ shopId, limit = 50, skip = 0 }) {
    const query = { shopId, isPublished: true };
    return await findAllPublishForShop({ query, limit, skip });
  }

  static async searchProducts({ keySearch }) {
    return await searchProductByUser({ keySearch });
  }

  static async findAllProducts({limit = 50, sort = "ctime", page = 1, filter = { isPublished: true }}) {
    return await findAllProducts({
      limit,
      sort,
      page,
      filter,
      select: ["productName", "price", "adsPicture", "shopId"],
    });
  }

  static async findProduct({ productId }) {
    return await findProduct({ productId, unSelect: ["__v"] });
  }
}

class Product {
  constructor({
    productName,
    thumbs = [],
    adsPicture,
    brand,
    price,
    priceReduction = 0,
    releaseDate,
    type,
    isDraft,
    attributes,
    isPublished,
    quantity,
    description,
    shopId,
    createdUserId,
    sku
  }) {
    this.productName = productName;
    this.thumbs = thumbs;
    this.adsPicture = adsPicture;
    this.brand = brand;
    this.price = price;
    this.priceReduction = priceReduction;
    this.releaseDate = releaseDate;
    this.type = type;
    this.isDraft = isDraft;
    this.attributes = attributes;
    this.createdUserId = createdUserId
    this.isPublished = isPublished;
    this.sku = sku
    this.shopId = shopId
    this.quantity = quantity;
    this.description = description
  }

  async createProduct(productId) {
    let newProduct = await productDB.create({
      ...this,
      _id: productId,
    });
    newProduct = newProduct.toObject();
    await inventoryService.createInventory({
      productId: newProduct._id,
      stock: this.quantity,
      shopId: newProduct.shopId,
    });
    return newProduct;
  }

  async updateProduct(productId, payload) {
    return await updateProductById(productId, payload, productDB);
  }
}

class Clothing extends Product {
  async createProduct(userId) {
    const shop = await getShopByIdToCheck(this.shopId);
    if (!shop) throw new BadRequestError("Shop not found")
    
    const staffs = shop.staffs;
    const getStaff = staffs.find((staff) => staff.userId.toString() === userId);

    if (!getStaff) if (shop.ownerId.toString !== userId) throw new BadRequestError("You are not shop owner");
  

    if (!isImageUrl(this.adsPicture)) throw new BadRequestError("Invalid image");
    if (!Array.isArray(this.thumbs)) throw new BadRequestError("Thumbs must be a list");

    this.thumbs.forEach((img) => {
      if (!isImageUrl(img))
        throw new BadRequestError("Invalid image in thumbs");
    });

    const newClothing = await productClothingDB.create({
      ...this.attributes,
      shopId: convertToObjectId(this.shopId),
    })

    if (!newClothing) throw new BadRequestError("Create new product error");

    const newProduct = await super.createProduct(newClothing._id);
    if (!newProduct) throw new BadRequestError("Create new product error");

    return newProduct;
  }

  async updateProduct(userId, productId) {
    const product = await findProductById(productId)
    if (!product) throw new BadRequestError('This product is not exits')

    const shop = await getShopByIdToCheck(product.shopId);
    if (!shop) throw new BadRequestError("Shop not found")
    
    const staffs = shop.staffs;
    const getStaff = staffs.find((staff) => staff.userId.toString() === userId);

    if (!getStaff) if (shop.ownerId.toString !== userId) throw new BadRequestError("You are not shop owner");

    const objectParams = removeUndefinedObject(this);


    if (objectParams.productName) {
        objectParams.slug = slugify(objectParams.productName, {lower: true})
    }

    if (objectParams?.attributes) await updateProductById(productId,updateNestedObjectParser(objectParams.attributes),productClothingDB)
    const updateProduct = await super.updateProduct(productId,updateNestedObjectParser(objectParams),productDB)
    return updateProduct.toObject();
  }
}

class Electronic extends Product {
  async createProduct(userId) {
    const shop = await getShopByIdToCheck(this.shopId);
    if (!shop) throw new BadRequestError("Shop not found")
    
    const staffs = shop.staffs;
    const getStaff = staffs.find((staff) => staff.userId.toString() === userId);

    if (!getStaff) if (shop.ownerId.toString() !== userId) throw new BadRequestError("You are not shop owner");
  
    if (!isImageUrl(this.adsPicture)) throw new BadRequestError("Invalid image");
    if (!Array.isArray(this.thumbs)) throw new BadRequestError("Thumbs must be a list");

    this.thumbs.forEach((img) => {
        if (!isImageUrl(img))
          throw new BadRequestError("Invalid image in thumbs");
    });

    const newElectronic = await productElectronicDB.create({
      ...this.attributes,
      shopId: this.shopId,
      shopId: convertToObjectId(this.shopId),
      createdUserId: convertToObjectId(userId),
    })

    if (!newElectronic) throw new BadRequestError("Create new product error")
    const newProduct = await super.createProduct(newElectronic._id)
    if (!newProduct) throw new BadRequestError("Create new product error")

    return newProduct;
  }

  async updateProduct(userId, productId) {
    const product = await findProductById(productId)
    if (!product) throw new BadRequestError('This product is not exits')

    const shop = await getShopByIdToCheck(product.shopId);
    if (!shop) throw new BadRequestError("Shop not found")
    
    const staffs = shop.staffs;
    const getStaff = staffs.find((staff) => staff.userId.toString() === userId);

    if (!getStaff) if (shop.ownerId.toString() !== userId) throw new BadRequestError("You are not shop owner");

    const objectParams = removeUndefinedObject(this);
    if (objectParams.productName) {
        objectParams.slug = slugify(objectParams.productName, {lower: true})
    }

    if (objectParams?.attributes) await updateProductById(productId,updateNestedObjectParser(objectParams.attributes),productElectronicDB)
    

    const updateProduct = await super.updateProduct(productId,updateNestedObjectParser(objectParams),productDB)
    return updateProduct.toObject();
  }

}

class Furniture extends Product {
  async createProduct(userId) {
    const shop = await getShopByIdToCheck(this.shopId);
    if (!shop) throw new BadRequestError("Shop not found")
    
    const staffs = shop.staffs;
    const getStaff = staffs.find((staff) => staff.userId.toString() === userId);

    if (!getStaff) if (shop.ownerId.toString() !== userId) throw new BadRequestError("You are not shop owner");
  

    if (!isImageUrl(this.adsPicture)) throw new BadRequestError("Invalid image");
    if (!Array.isArray(this.thumbs)) throw new BadRequestError("Thumbs must be a list");

    this.thumbs.forEach((img) => {
        if (!isImageUrl(img))
          throw new BadRequestError("Invalid image in thumbs");
    });


    const newFurniture = await productFurnitureDB.create({
      ...this.attributes,
      shopId: this.shopId,
      shopId: convertToObjectId(this.shopId),
      createdUserId: convertToObjectId(userId),
    });

    if (!newFurniture) throw new BadRequestError("Create new product error");

    const newProduct = await super.createProduct(newFurniture._id);
    if (!newProduct) throw new BadRequestError("Create new product error");

    return newProduct;
  }

  async updateProduct(userId, productId) {
    const product = await findProductById(productId)
    if (!product) throw new BadRequestError('This product is not exits')

    const shop = await getShopByIdToCheck(product.shopId);
    if (!shop) throw new BadRequestError("Shop not found")
    
    const staffs = shop.staffs;
    const getStaff = staffs.find((staff) => staff.userId.toString() === userId);
    if (!getStaff) if (shop.ownerId.toString() !== userId) throw new BadRequestError("You are not shop owner");

    const objectParams = removeUndefinedObject(this)

    if (objectParams.productName) {
        objectParams.slug = slugify(objectParams.productName, {lower: true})
    }

    if (objectParams?.attributes) await updateProductById(productId,updateNestedObjectParser(objectParams.attributes),productFurnitureDB)
    

    const updateProduct = await super.updateProduct(productId,updateNestedObjectParser(objectParams),productDB)
    return updateProduct.toObject();
  }
}

ProductFactory.registerProductType("Clothing", Clothing);
ProductFactory.registerProductType("Electronics", Electronic);
ProductFactory.registerProductType("Furniture", Furniture);

module.exports = ProductFactory;
