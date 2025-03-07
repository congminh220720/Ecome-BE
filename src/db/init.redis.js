'use strict'; 
const Redis = require('ioredis');
const { redis: { port, host } } = require('../config/config.db');

class RedisDatabase {
    constructor() {
        this.client = new Redis({
            host: host || '127.0.0.1',
            port: port || 6380,
        });

        this.client.on('connect', () => {
            console.log('✅ Connected to Redis successfully');
        });

        this.client.on('error', (err) => {
            console.error('❌ Redis connection error:', err);
        });
    }

    static getInstance() {
        if (!RedisDatabase.instance) {
            RedisDatabase.instance = new RedisDatabase();
        }
        return RedisDatabase.instance.client; // ⚠️ Chỉ export client của ioredis
    }
}

module.exports = RedisDatabase.getInstance();
