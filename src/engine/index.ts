import logger from "@services/logger.service"
import { startWalletWorker } from "./workers/wallet.worker"

const setUpWorkers = async () =>{
    logger.info("Setting up workers...")

    await startWalletWorker()
}

export default setUpWorkers