import prisma from "@db/prisma";
import { Prisma, User } from "@prisma/client";
import { DatabaseError } from "@managers/error.manager";


class UserRepository {
  async create(
    data: Prisma.UserCreateInput
  ): Promise<User> {
    try {
      return await prisma.user.create({
        data,
      });
    } catch (error: any) {
      throw new DatabaseError(`Error creating user: ${error.message}`);
    }
  }

  async findById(id: string): Promise<User | null> {
    try {
      return await prisma.user.findUnique({
        where: { id },
      });
    } catch (error: any) {
      throw new DatabaseError(`Error finding user by id: ${error.message}`);
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    try {
      return await prisma.user.findUnique({
        where: { email },
      });
    } catch (error: any) {
      throw new DatabaseError(`Error finding user by email: ${error.message}`);
    }
  }

  async update(id: string, data: Prisma.UserUpdateInput): Promise<User> {
    try {
      return await prisma.user.update({
        where: { id },
        data,
      });
    } catch (error: any) {
      throw new DatabaseError(`Error updating user: ${error.message}`);
    }
  }

  async setPinHash(id: string, pinHash: string): Promise<User> {
    try {
      return await prisma.user.update({
        where: { id },
        data: { pinHash },
      });
    } catch (error: any) {
      throw new DatabaseError(`Error setting PIN: ${error.message}`);
    }
  }

  async getPinHash(id: string): Promise<string | null> {
    try {
      const user = await prisma.user.findUnique({
        where: { id },
        select: { pinHash: true },
      });
      return user?.pinHash ?? null;
    } catch (error: any) {
      throw new DatabaseError(`Error fetching PIN: ${error.message}`);
    }
  }

  async delete(id: string): Promise<User> {
    try {
      // Soft delete by setting deletedAt
      return await prisma.user.update({
        where: { id },
        data: { deletedAt: new Date() },
      });
    } catch (error: any) {
      throw new DatabaseError(`Error deleting user: ${error.message}`);
    }
  }

 
}

export default UserRepository;
