const redisClient = require('../../../db/init.redis');
const { reservationInventory } = require('../../../models/repositories/inventory.repo')

const pessimisticProductInventory = async (productId, quantity) =>{
    const lockKey = `lock:proId:${productId}`
    const lockTimeout = 3000
    const retryTimes = 10

    for (let i = 0; i < retryTimes; i++) {
        const result = await redisClient.set(lockKey,lockTimeout, 'NX', 'PX', lockTimeout)
        if (result === 'OK') {
            const isReservation = await reservationInventory(
                productId,
                quantity,
            )

            if (isReservation.modifiedCount) {
                return lockKey
            }

            await releaseLock(lockKey)
            return null
        } else {
            await new Promise((resolve) => setTimeout(resolve, 500));
        }
    }
    return null
}

const releaseLock = async (keyLock) => {
    return await redisClient.del(keyLock);
};


module.exports = {
    pessimisticProductInventory,
    releaseLock
}