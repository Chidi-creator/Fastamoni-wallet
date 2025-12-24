"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const env_1 = require("../../config/env");
const bank_usecase_1 = __importDefault(require("../../usecases/bank.usecase"));
const logger_service_1 = __importDefault(require("../../services/logger.service"));
class BankSeeder {
    constructor() {
        this.bankUsecase = new bank_usecase_1.default();
        this.bankApi = "https://api.flutterwave.com/v3/banks/NG";
    }
    async fetchBanksFromFlutterwave() {
        try {
            logger_service_1.default.info("Fetching banks from Flutterwave API...");
            const response = await axios_1.default.get(this.bankApi, {
                headers: {
                    Authorization: `Bearer ${env_1.env.FLUTTERWAVE_SANDBOX_SECRET_KEY}`,
                },
            });
            if (response.data.status === "success") {
                logger_service_1.default.info(` Successfully fetched ${response.data.data.length} banks`);
                return response.data.data;
            }
            else {
                throw new Error(`API Error: ${response.data.message}`);
            }
        }
        catch (error) {
            logger_service_1.default.error(`Failed to fetch banks: ${error.message}`);
            throw error;
        }
    }
    mapFlutterwaveToBankInput(FlutterwaveBanks) {
        return FlutterwaveBanks.map((bank) => ({
            bank_name: bank.name,
            bank_code: bank.code,
        }));
    }
    async seedBanks() {
        try {
            console.log("Starting bank seeding process...");
            // Check if banks already exist
            const existingBanks = await this.bankUsecase.findAllBanks();
            if (existingBanks.length > 0) {
                console.log(` ${existingBanks.length} banks already exist. Skipping seeding.`);
                console.log(" If you want to re-seed, clear the banks table first.");
                return;
            }
            // Fetch from Flutterwave
            const flutterwaveBanks = await this.fetchBanksFromFlutterwave();
            // Map to our schema
            const banksToInsert = this.mapFlutterwaveToBankInput(flutterwaveBanks);
            logger_service_1.default.info("Inserting banks into database...");
            const banks = await this.bankUsecase.insertMany(banksToInsert);
            logger_service_1.default.info(` Successfully inserted ${banks.inserted} banks into the database.`);
        }
        catch (error) {
            logger_service_1.default.error(" Error seeding banks:", error.message);
            throw error;
        }
    }
}
async function runBankSeeder() {
    const seeder = new BankSeeder();
    try {
        await seeder.seedBanks();
        console.log("\n Bank seeding completed successfully!");
        process.exit(0);
    }
    catch (error) {
        console.error("\n Bank seeding failed:", error);
        process.exit(1);
    }
}
if (require.main === module) {
    runBankSeeder();
}
//# sourceMappingURL=seed-banks.js.map