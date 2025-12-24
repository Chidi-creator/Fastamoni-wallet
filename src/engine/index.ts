import logger from "@services/logger.service"
import { startWalletWorker } from "./workers/wallet.worker"
import { startTransactionWorker } from "./workers/transaction.worker"

const setUpWorkers = async () =>{
    logger.info("Setting up workers...")

    await startWalletWorker()
    await startTransactionWorker()
}

export default setUpWorkers