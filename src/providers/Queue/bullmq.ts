import {Queue, Worker} from "bullmq";
import { env } from "@config/env";
import { ConnectionOptions } from "./types/bullMq";

export type ProcessorFn = (job: any) => Promise<any>;

class BullMQConfig {
  private static instance: BullMQConfig;
  private connectionOptions: ConnectionOptions;
  private constructor() {
    this.connectionOptions = {
      host: env.REDIS_HOST,
      port: env.REDIS_PORT,
      username: env.REDIS_USERNAME,
      password: env.REDIS_PASSWORD,
    };
  }

  public static getInstance(): BullMQConfig {
    if (!BullMQConfig.instance) {
      BullMQConfig.instance = new BullMQConfig();
    }
    return BullMQConfig.instance;
  }

  public async createQueue(name: string): Promise<Queue> {
    const queue = new Queue(name, {
      connection: this.connectionOptions,
      defaultJobOptions: {
        removeOnComplete: 10,
        removeOnFail: 5,
      },
    });
    return queue;
  }

  public async createWorker(
    name: string,
    processor: ProcessorFn
  ): Promise<Worker> {
    const worker = new Worker(name, processor, {
      connection: this.connectionOptions,
    });
    return worker;
  }

  public async scheduleJob(
    queue: Queue,
    jobName: string,
    data: any,
    schedule: string
  ) {
  
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

export default BullMQConfig;