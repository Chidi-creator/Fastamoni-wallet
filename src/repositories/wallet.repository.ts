import prisma from "@db/prisma";
import { Prisma, Wallet } from "@prisma/client";
import { DatabaseError } from "@managers/error.manager";

class WalletRepository {
    async create(
        data: Prisma.WalletUncheckedCreateInput
    ): Promise<Wallet> {
        try {
            return await prisma.wallet.create({
                data,
            });
         
        } catch (error: any) {
            throw new DatabaseError(`Error creating wallet: ${error.message}`);
        }
    }

    async findById(id: string): Promise<Wallet | null> {
        try {
            return await prisma.wallet.findUnique({
                where: { id },
            });
        } catch (error: any) {
            throw new DatabaseError(`Error finding wallet by id: ${error.message}`);
        }
    }

    async update(id: string, data: Prisma.WalletUpdateInput): Promise<Wallet> {
        try {
            return await prisma.wallet.update({
                where: { id },
                data,
            });
        } catch (error: any) {
            throw new DatabaseError(`Error updating wallet: ${error.message}`);
        }
    }
    async delete(id: string): Promise<Wallet> {
        try {
            // Soft delete by setting deletedAt
            return await prisma.wallet.update({
                where: { id },
                data: { deletedAt: new Date() },
            });
        } catch (error: any) {
            throw new DatabaseError(`Error deleting wallet: ${error.message}`);
        }
    }
}

export default WalletRepository;