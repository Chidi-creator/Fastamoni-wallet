import NodemailerConfig from "./notifications/nodemailer";
import RedisConfig from "./cache/redis";

export const nodemailerConfig = NodemailerConfig.getInstance();
export const redisConfig = RedisConfig.getInstance();