import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

class CacheService {
  constructor() {
    this.client = null;
    this.isConnected = false;
    this.initializeRedis();
  }

  initializeRedis() {
    try {
      if (process.env.REDIS_ENABLED === 'true') {
        this.client = new Redis({
          host: process.env.REDIS_HOST || 'localhost',
          port: process.env.REDIS_PORT || 6379,
          password: process.env.REDIS_PASSWORD,
          retryStrategy: (times) => {
            const delay = Math.min(times * 50, 2000);
            return delay;
          },
          maxRetriesPerRequest: 1
        });

        this.client.on('error', (error) => {
          console.log('ℹ️ Redis not available, using in-memory cache');
          this.isConnected = false;
        });

        this.client.on('connect', () => {
          console.log('✅ Redis Connected');
          this.isConnected = true;
        });
      }
    } catch (error) {
      console.log('ℹ️ Redis not available, using in-memory cache');
      this.isConnected = false;
    }
  }

  // Simple in-memory cache as fallback
  memoryCache = new Map();

  async get(key) {
    try {
      if (this.isConnected && this.client) {
        return await this.client.get(key);
      }
      return this.memoryCache.get(key);
    } catch (error) {
      return this.memoryCache.get(key);
    }
  }

  async set(key, value, ttl = 300) {
    try {
      if (this.isConnected && this.client) {
        await this.client.setex(key, ttl, value);
      } else {
        this.memoryCache.set(key, value);
        setTimeout(() => this.memoryCache.delete(key), ttl * 1000);
      }
    } catch (error) {
      this.memoryCache.set(key, value);
      setTimeout(() => this.memoryCache.delete(key), ttl * 1000);
    }
  }

  async del(key) {
    try {
      if (this.isConnected && this.client) {
        await this.client.del(key);
      }
      this.memoryCache.delete(key);
    } catch (error) {
      this.memoryCache.delete(key);
    }
  }
}

export default new CacheService(); 