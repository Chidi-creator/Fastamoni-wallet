"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../providers/index");
class CacheService {
    async get(key) {
        try {
            const value = await index_1.redisConfig.get(key);
            return value ? JSON.parse(value) : null;
        }
        catch (error) {
            console.error("Error getting value from Redis", error);
            return null;
        }
    }
    async set(key, value, ttl) {
        try {
            const stringValue = JSON.stringify(value);
            await index_1.redisConfig.set(key, stringValue, ttl);
        }
        catch (error) {
            console.error("Error setting value in Redis", error);
        }
    }
    async del(key) {
        try {
            await index_1.redisConfig.del(key);
        }
        catch (error) {
            console.error("Error deleting key from Redis", error);
        }
    }
}
exports.default = CacheService;
//# sourceMappingURL=cache.service.js.map