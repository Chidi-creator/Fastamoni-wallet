"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("@providers/index");
class QueueService {
    async createQueue(name) {
        return await index_1.bullMqConfig.createQueue(name);
    }
    async createWorker(name, processor) {
        return index_1.bullMqConfig.createWorker(name, processor);
    }
    async scheduleJob(queue, jobName, data, schedule) {
        return await index_1.bullMqConfig.scheduleJob(queue, jobName, data, schedule);
    }
}
exports.default = QueueService;
//# sourceMappingURL=queue.service.js.map