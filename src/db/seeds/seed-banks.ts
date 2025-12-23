import axios from "axios";
import { env } from "@config/env";
import BankUsecase from "@usecases/bank.usecase";
import logger from "@services/logger.service";
import { log } from "node:console";

interface FlutterwaveBank {
  id: number;
  code: string;
  name: string;
}

interface FlutterwaveBanksResponse {
  status: string;
  message: string;
  data: FlutterwaveBank[];
}

class BankSeeder {
  private bankUsecase: BankUsecase;
  bankApi: string;

  constructor() {
    this.bankUsecase = new BankUsecase();
    this.bankApi = "https://api.flutterwave.com/v3/banks/NG";
  }

  async fetchBanksFromFlutterwave(): Promise<FlutterwaveBank[]> {
    try {
      logger.info("Fetching banks from Flutterwave API...");
      const response = await axios.get<FlutterwaveBanksResponse>(this.bankApi, {
        headers: {
          Authorization: `Bearer ${env.FLUTTERWAVE_SANDBOX_SECRET_KEY}`,
        },
      });
      if (response.data.status === "success") {
        logger.info(` Successfully fetched ${response.data.data.length} banks`);
        return response.data.data;
      } else {
        throw new Error(`API Error: ${response.data.message}`);
      }
    } catch (error: any) {
      logger.error(`Failed to fetch banks: ${error.message}`);
      throw error;
    }
  }

  mapFlutterwaveToBankInput(FlutterwaveBanks: FlutterwaveBank[]) {
    return FlutterwaveBanks.map((bank) => ({
      bank_name: bank.name,
      bank_code: bank.code,
    }));
  }

  async seedBanks(): Promise<void> {
    try {
      console.log("Starting bank seeding process...");

      // Check if banks already exist
      const existingBanks = await this.bankUsecase.findAllBanks();
      if (existingBanks.length > 0) {
        console.log(
          ` ${existingBanks.length} banks already exist. Skipping seeding.`
        );
        console.log(" If you want to re-seed, clear the banks table first.");
        return;
      }

      // Fetch from Flutterwave
      const flutterwaveBanks = await this.fetchBanksFromFlutterwave();

      // Map to our schema
      const banksToInsert = this.mapFlutterwaveToBankInput(flutterwaveBanks);

      logger.info("Inserting banks into database...");

      const banks = await this.bankUsecase.insertMany(banksToInsert);
      logger.info(
        ` Successfully inserted ${banks.inserted} banks into the database.`
      );
    } catch (error: any) {
      logger.error(" Error seeding banks:", error.message);
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
  } catch (error) {
    console.error("\n Bank seeding failed:", error);
    process.exit(1);
  }
}

if (require.main === module) {
  runBankSeeder();
}
