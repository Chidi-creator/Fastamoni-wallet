"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bullmq_1 = require("bullmq");
const env_1 = require("@config/env");
class BullMQConfig {
    constructor() {
        this.connectionOptions = {
            host: env_1.env.REDIS_HOST,
            port: env_1.env.REDIS_PORT,
            username: env_1.env.REDIS_USERNAME,
            password: env_1.env.REDIS_PASSWORD,
        };
    }
    static getInstance() {
        if (!BullMQConfig.instance) {
            BullMQConfig.instance = new BullMQConfig();
        }
        return BullMQConfig.instance;
    }
    async createQueue(name) {
        const queue = new bullmq_1.Queue(name, {
            connection: this.connectionOptions,
            defaultJobOptions: {
                removeOnComplete: 10,
                removeOnFail: 5,
            },
        });
        return queue;
    }
    async createWorker(name, processor) {
        const worker = new bullmq_1.Worker(name, processor, {
            connection: this.connectionOptions,
        });
        return worker;
    }
    async scheduleJob(queue, jobName, data, schedule) {
        await queue.add(jobName, data, {
            attempts: 2,
            removeOnComplete: true,
            removeOnFail: 50,
            jobId: `repeat-${jobName}`,
            repeat: {
                pattern: schedule,
            }
        });
    }
}
exports.default = BullMQConfig;
//# sourceMappingURL=bullmq.js.map