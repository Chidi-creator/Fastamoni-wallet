"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const redis_1 = require("redis");
const env_1 = require("@config/env");
const error_manager_1 = require("@managers/error.manager");
class RedisConfig {
    constructor() {
        this.connected = false;
        this.client = (0, redis_1.createClient)({
            username: env_1.env.REDIS_USERNAME,
            password: env_1.env.REDIS_PASSWORD,
            socket: {
                host: env_1.env.REDIS_HOST,
                port: env_1.env.REDIS_PORT,
            },
        });
        this.client.on("error", (err) => {
            console.error("Redis Client Error", err);
        });
        this.client.on("connect", () => {
            console.log("Redis client connecting...");
        });
        this.client.on("ready", () => {
            console.log("Redis client connected successfully");
            this.connected = true;
        });
    }
    // Singleton pattern to ensure only one instance of RedisConfig exists
    static getInstance() {
        if (!RedisConfig.instance) {
            RedisConfig.instance = new RedisConfig();
        }
        return RedisConfig.instance;
    }
    // Method to explicitly connect
    async connect() {
        try {
            if (!this.connected) {
                await this.client.connect();
            }
        }
        catch (err) {
            console.error("Error connecting to Redis client", err);
            throw new error_manager_1.ProviderError("Redis Connection Error:", err);
        }
    }
    // Method to check if connected
    isConnected() {
        return this.connected;
    }
    async get(key) {
        try {
            const value = await this.client.get(key);
            return value;
        }
        catch (error) {
            console.error("Error getting value from Redis", error);
            return null;
        }
    }
    async set(key, value, ttl) {
        try {
            if (ttl) {
                await this.client.setEx(key, ttl, value);
            }
            else {
                await this.client.set(key, value);
            }
        }
        catch (error) {
            console.error("Error setting value in Redis", error);
        }
    }
    async del(key) {
        try {
            await this.client.del(key);
        }
        catch (error) {
            console.error("Error deleting key from Redis", error);
        }
    }
}
exports.default = RedisConfig;
//# sourceMappingURL=redis.js.map