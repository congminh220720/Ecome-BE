const { userAddressDB } = require('../userAddress.model')

const getAddressById = async (id) => {
    return userAddressDB.findById(id).lean()
}

module.exports = {
    getAddressById
}