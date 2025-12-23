import { createClient, RedisClientType } from "redis";
import { env } from "@config/env";
import { ProviderError } from "@managers/error.manager";

class RedisConfig {
  private client: RedisClientType;
  private static instance: RedisConfig;
  private connected: boolean = false;

  private constructor() {
    this.client = createClient({
      username: env.REDIS_USERNAME,
      password: env.REDIS_PASSWORD,
      socket: {
        host: env.REDIS_HOST,
        port: env.REDIS_PORT,
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
  public static getInstance(): RedisConfig {
    if (!RedisConfig.instance) {
      RedisConfig.instance = new RedisConfig();
    }
    return RedisConfig.instance;
  }

  // Method to explicitly connect
  public async connect(): Promise<void> {
    try {
      if (!this.connected) {
        await this.client.connect();
      }
    } catch (err: any) {
      console.error("Error connecting to Redis client", err);
      throw new ProviderError("Redis Connection Error:", err);
    }
  }

  // Method to check if connected
  public isConnected(): boolean {
    return this.connected;
  }

  public async get(key: string): Promise<string | null> {
    try {
      const value = await this.client.get(key);
      return value;
    } catch (error) {
      console.error("Error getting value from Redis", error);
      return null;
    }
  }

  public async set(key: string, value: string, ttl?: number): Promise<void> {
    try {
      if (ttl) {
        await this.client.setEx(key, ttl, value);
      } else {
        await this.client.set(key, value);
      }
    } catch (error) {
      console.error("Error setting value in Redis", error);
    }
  }

  public async del(key: string): Promise<void> {
    try {
      await this.client.del(key);
    } catch (error) {
      console.error("Error deleting key from Redis", error);
    }
  }
}

export default RedisConfig;
