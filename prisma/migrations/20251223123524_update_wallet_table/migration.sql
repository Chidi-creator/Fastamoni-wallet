/*
  Warnings:

  - A unique constraint covering the columns `[wallet_number]` on the table `Wallet` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `bank_code` to the `Wallet` table without a default value. This is not possible if the table is not empty.
  - Added the required column `bank_name` to the `Wallet` table without a default value. This is not possible if the table is not empty.
  - Added the required column `wallet_number` to the `Wallet` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Wallet" ADD COLUMN     "bank_code" TEXT NOT NULL,
ADD COLUMN     "bank_name" TEXT NOT NULL,
ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'NGN',
ADD COLUMN     "wallet_number" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Wallet_wallet_number_key" ON "Wallet"("wallet_number");
