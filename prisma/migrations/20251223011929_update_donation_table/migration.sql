-- AddForeignKey
ALTER TABLE "Donation" ADD CONSTRAINT "Donation_donorId_fkey" FOREIGN KEY ("donorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Donation" ADD CONSTRAINT "Donation_beneficiaryId_fkey" FOREIGN KEY ("beneficiaryId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
