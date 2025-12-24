import { bullMqConfig } from "@providers/index";
import { Queue } from "bullmq";
import { ProcessorFn } from "@providers/Queue/bullmq";
class QueueService {
  public async createQueue(name: string) {
    return await bullMqConfig.createQueue(name);
  }

  public async createWorker(name: string, processor: ProcessorFn) {
    return bullMqConfig.createWorker(name, processor);
  }

  public async scheduleJob(
    queue: Queue,
    jobName: string,
    data: any,
    schedule: string
  ) {
    return await bullMqConfig.scheduleJob(queue, jobName, data, schedule);
  }
}

export default QueueService;
