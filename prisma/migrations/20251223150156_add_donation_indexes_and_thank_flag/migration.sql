-- AlterTable
ALTER TABLE "Donation" ADD COLUMN     "thankYouSent" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "Donation_donorId_idx" ON "Donation"("donorId");

-- CreateIndex
CREATE INDEX "Donation_beneficiaryId_idx" ON "Donation"("beneficiaryId");

-- CreateIndex
CREATE INDEX "Donation_createdAt_idx" ON "Donation"("createdAt");
