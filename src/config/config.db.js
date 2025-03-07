const develop = {
    app: {
        port: process.env.DEV_APP_PORT
    },
    db: {
        port:process.env.DEV_DB_PORT,
        host: process.env.DEV_DB_HOST,
        name: process.env.DEV_DB_NAME,
    },
    redis: {
        port:process.env.DEV_REDIS_PORT,
        host:process.env.DEV_REDIS_HOST,
        password:process.env.DEV_REDIS_PASSWORD
    }
}

const production = {
    app: {
        port: process.env.PRO_APP_PORT
    },
    db: {
        port:process.env.PRO_DB_PORT,
        host: process.env.PRO_DB_HOST,
        name: process.env.PRO_DB_NAME,
    },
    redis: {
        port:process.env.PRO_REDIS_PORT,
        host:process.env.PRO_REDIS_HOST,
        password:process.env.PRO_REDIS_PASSWORD
    }
}

const configs = {develop,production}
const env = process.env.NODE_ENV || 'develop'

module.exports = configs[env]