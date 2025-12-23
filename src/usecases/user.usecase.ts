import  bcrypt from "bcrypt";
import UserRepository from "@repositories/users.repository";
import { Prisma } from "@prisma/client";

class UserUseCase {
  userRepository: UserRepository;
  private readonly saltRounds = 10;

  constructor() {
    this.userRepository = new UserRepository();
  }

  private async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.saltRounds);
  }

  async createUser(data: Prisma.UserCreateInput) {
    const hashedPassword = await this.hashPassword(data.password);
    return this.userRepository.create({ ...data, password: hashedPassword });
  }
  async getUserById(id: string) {
    return this.userRepository.findById(id);
  }
  async getUserByEmail(email: string) {
    return this.userRepository.findByEmail(email);
  }
  async updateUser(id: string, data: Prisma.UserUpdateInput) {
    const payload: Prisma.UserUpdateInput = { ...data };

    if (payload.password) {
      const candidate =
        typeof payload.password === "string"
          ? payload.password
          : (payload.password as Prisma.StringFieldUpdateOperationsInput).set;

      if (candidate) {
        const hashedPassword = await this.hashPassword(candidate);

        payload.password =
          typeof payload.password === "string"
            ? hashedPassword
            : { ...payload.password, set: hashedPassword };
      }
    }

    return this.userRepository.update(id, payload);
  }
  async deleteUser(id: string) {
    return this.userRepository.delete(id);
  }
}

export default UserUseCase;
