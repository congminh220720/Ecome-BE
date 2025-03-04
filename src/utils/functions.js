'use strict'

const { Types } = require('mongoose')

const convertToObjectId = id => new Types.ObjectId(id)

const removeUndefinedObject = (obj) => {
    Object.keys(obj).forEach( k => {
        if (obj[k] == null) {
            delete obj[k]
        }
    })

    return obj
}

const updateNestedObjectParser = obj => {
    const final = {}
    Object.keys(obj).forEach( k => {
        if (typeof obj[k] === 'Object' && !Array.isArray(obj[k])) {
            const response = updateNestedObjectParser(obj[k])
            Object.key(response).forEach(a =>  {
                final[`${k}.${a}`] = res[a]
            })
        } else {
            final[k] = obj[k]
        }
    })
    return final
}

function isImageUrl(url) {
    if (typeof url !== "string") return false;

    try {
        const parsedUrl = new URL(url); // Kiểm tra xem URL có hợp lệ không
        const pathname = parsedUrl.pathname; // Lấy phần path của URL
        const imageExtensions = /\.(jpg|jpeg|png|gif|bmp|webp|svg)$/i;
        return imageExtensions.test(pathname);
    } catch {
        return false;
    }
}


function validateEmail(email) {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
}
  
  
const getSelectData = (select = []) => {
    return Object.fromEntries(select.map(el => [el, 1]))
}

const getUnSelectData = (select = []) => {
    return Object.fromEntries(select.map(el => [el, 0]))
}

function calculatePercentage(value, percent) {
    return (percent / 100) * value;
}

module.exports = {
    convertToObjectId,
    removeUndefinedObject,
    isImageUrl,
    validateEmail,
    updateNestedObjectParser,
    getSelectData,
    getUnSelectData,
    calculatePercentage
}