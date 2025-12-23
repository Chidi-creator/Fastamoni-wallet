import UserRepository from "@repositories/users.repository";
import { Prisma } from "@prisma/client";

class UserUseCase {
  userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  async createUser(data: Prisma.UserCreateInput) {
    return this.userRepository.create(data);
  }
  async getUserById(id: string) {
    return this.userRepository.findById(id);
  }
  async getUserByEmail(email: string) {
    return this.userRepository.findByEmail(email);
  }
  async updateUser(id: string, data: Prisma.UserUpdateInput) {
    return this.userRepository.update(id, data);
  }
  async deleteUser(id: string) {
    return this.userRepository.delete(id);
  }
}

export default UserUseCase;
