'use strict'

const { userDB } = require('../user.model')

const getUserByEmail = (email) =>  userDB.findOne({email}).lean()

const getUserById = (id) => userDB.findById(id).lean()

const removeFiledNotNeed = (user) => {
    delete user.oldPasswords
    delete user.changePasswordCount
    delete user.loginCount
    delete user.incorrectLoginCount
    delete user.password
    delete user.__v

    return {...user}
}

module.exports = {
    getUserByEmail,
    getUserById,
    removeFiledNotNeed
}