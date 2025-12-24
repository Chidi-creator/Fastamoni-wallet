import bcrypt from "bcrypt";
import UserRepository from "@repositories/users.repository";
import { Prisma, User } from "@prisma/client";
import { BadRequestError } from "@managers/error.manager";
import CacheService from "@services/cache.service";

class UserUseCase {
  userRepository: UserRepository;
  private readonly saltRounds = 10;
  private cacheService: CacheService;

  constructor() {
    this.userRepository = new UserRepository();
    this.cacheService = new CacheService();
  }

  private async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.saltRounds);
  }

  async createUser(data: Prisma.UserCreateInput) {
    const hashedPassword = await this.hashPassword(data.password);
    return this.userRepository.create({ ...data, password: hashedPassword });
  }
  async getUserById(id: string): Promise<User | null> {
    const cacheKey = `user:id:${id}`;
    const cachedUser = await this.cacheService.get<User>(cacheKey);
    if (cachedUser) {
      return cachedUser;
    }
    const user = await this.userRepository.findById(id);
    if (user) {
      await this.cacheService.set(cacheKey, user, 3600);
    }
    return user;
  }
  async getUserByEmail(email: string): Promise<User | null> {
    const cacheKey = `user:email:${email}`;
    const cachedUser = await this.cacheService.get<User>(cacheKey);
    if (cachedUser) {
      return cachedUser;
    }
    const user = await this.userRepository.findByEmail(email);
    if (user) {
      await this.cacheService.set(cacheKey, user, 3600); // Cache for 1 hour
    }
    return user;
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

  async setPin(userId: string, pin: string) {
    this.validatePin(pin);
    const pinHash = await this.hashPassword(pin);
    return this.userRepository.setPinHash(userId, pinHash);
  }

  async updatePin(userId: string, oldPin: string, newPin: string) {
    this.validatePin(newPin);
    const storedPinHash = await this.userRepository.getPinHash(userId);

    if (!storedPinHash) {
      throw new BadRequestError("PIN not set");
    }

    const isMatch = await bcrypt.compare(oldPin, storedPinHash);
    if (!isMatch) {
      throw new BadRequestError("Invalid old PIN");
    }

    const newHash = await this.hashPassword(newPin);
    return this.userRepository.setPinHash(userId, newHash);
  }

  private validatePin(pin: string) {
    if (!/^[0-9]{4,6}$/.test(pin)) {
      throw new BadRequestError("PIN must be 4-6 digits");
    }
  }

  async verifyPin(userId: string, pin: string): Promise<boolean> {
    const storedPinHash = await this.userRepository.getPinHash(userId);
    if (!storedPinHash) {
      return false;
    }
    return bcrypt.compare(pin, storedPinHash);
  }

  async setThanked(userId: string, thanked: boolean) {
    return this.userRepository.update(userId, { thanked });
  }
}

export default UserUseCase;
