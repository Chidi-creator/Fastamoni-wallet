import { redisConfig } from "@providers/index";

class CacheService {
  public async get<T>(key: string): Promise<T | null> {
    try {
      const value = await redisConfig.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error("Error getting value from Redis", error);
      return null;
    }
  }

  public async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    try {
      const stringValue = JSON.stringify(value);
      await redisConfig.set(key, stringValue, ttl);
    } catch (error) {
      console.error("Error setting value in Redis", error);
    }
  }

  public async del(key: string): Promise<void> {
    try {
      await redisConfig.del(key);
    } catch (error) {
      console.error("Error deleting key from Redis", error);
    }
  }
}

export default CacheService;
