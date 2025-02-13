'use strict'
const { CREATED, SuccessResponse } = require("../core/success.response")
const UserService = require('../services/user.service')

class UserController {
    signin = async (req, res, next) => {
        console.log(1)
        new CREATED({
            message: 'Registered OK !',
            metadata: await UserService.signin(req.body)
        }).send(res)
    }   

    login = async (req, res, next) => {
        new SuccessResponse({
            message: 'Login success',
            metadata: await UserService.login(req.body)
        }).send(res)
    }   

    updateUser = async (req, res, next) => {
        new SuccessResponse({
            message: 'Update Success!',
            metadata: await UserService.updateUser(req.user._id,req.body)
        }).send(res)
    }  
    
    changePassword = async (req, res, next) => {
        new SuccessResponse({
            message: 'Change password Success!',
            metadata: await UserService.changePassword(req.user._id,req.body)
        }).send(res)
    }  

    getUser = async (req, res, next) => {
        new SuccessResponse({
            message: 'get user success',
            metadata: await UserService.getUser(req.user._id)
        }).send(res)
    }   

    logout = async (req, res, next) => {
        new SuccessResponse({
            message: 'Logout success',
            metadata: await UserService.logout(req.keyStore)
        }).send(res)
    }   

    refreshToken = async (req, res, next) => {
        new SuccessResponse({
            message: 'refresh token success',
            metadata: await UserService.refreshToken(req.user._id,req.body)
        }).send(res)
    }   
}

module.exports = new UserController()