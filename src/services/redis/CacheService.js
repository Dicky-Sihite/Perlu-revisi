const redis = require('redis');

class CacheService {
  constructor() {
    this._client = redis.createClient({
      socket: {
        host: process.env.REDIS_SERVER,
      },
    });

    this._client.on('error', (error) => {
      console.error('Redis error:', error);
    });

    this._client.on('connect', () => {
      console.log('Connected to Redis');
    });

    this._client.connect();
  }

  async set(key, value, expirationInSecond = 1800) {
    try {
      const stringifiedValue = JSON.stringify(value);
      await this._client.setEx(key, expirationInSecond, stringifiedValue);
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }

  async get(key) {
    try {
      const result = await this._client.get(key);
      return result ? JSON.parse(result) : null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  async delete(key) {
    try {
      return await this._client.del(key);
    } catch (error) {
      console.error('Cache delete error:', error);
      return 0;
    }
  }
}

module.exports = CacheService;