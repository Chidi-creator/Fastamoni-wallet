"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcrypt_1 = __importDefault(require("bcrypt"));
const users_repository_1 = __importDefault(require("../repositories/users.repository"));
const error_manager_1 = require("../managers/error.manager");
const cache_service_1 = __importDefault(require("../services/cache.service"));
class UserUseCase {
    constructor() {
        this.saltRounds = 10;
        this.userRepository = new users_repository_1.default();
        this.cacheService = new cache_service_1.default();
    }
    async hashPassword(password) {
        return bcrypt_1.default.hash(password, this.saltRounds);
    }
    async createUser(data) {
        const hashedPassword = await this.hashPassword(data.password);
        return this.userRepository.create({ ...data, password: hashedPassword });
    }
    async getUserById(id) {
        const cacheKey = `user:id:${id}`;
        const cachedUser = await this.cacheService.get(cacheKey);
        if (cachedUser) {
            return cachedUser;
        }
        const user = await this.userRepository.findById(id);
        if (user) {
            await this.cacheService.set(cacheKey, user, 3600);
        }
        return user;
    }
    async getUserByEmail(email) {
        const cacheKey = `user:email:${email}`;
        const cachedUser = await this.cacheService.get(cacheKey);
        if (cachedUser) {
            return cachedUser;
        }
        const user = await this.userRepository.findByEmail(email);
        if (user) {
            await this.cacheService.set(cacheKey, user, 3600); // Cache for 1 hour
        }
        return user;
    }
    async updateUser(id, data) {
        const payload = { ...data };
        if (payload.password) {
            const candidate = typeof payload.password === "string"
                ? payload.password
                : payload.password.set;
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
    async deleteUser(id) {
        return this.userRepository.delete(id);
    }
    async setPin(userId, pin) {
        this.validatePin(pin);
        const pinHash = await this.hashPassword(pin);
        return this.userRepository.setPinHash(userId, pinHash);
    }
    async updatePin(userId, oldPin, newPin) {
        this.validatePin(newPin);
        const storedPinHash = await this.userRepository.getPinHash(userId);
        if (!storedPinHash) {
            throw new error_manager_1.BadRequestError("PIN not set");
        }
        const isMatch = await bcrypt_1.default.compare(oldPin, storedPinHash);
        if (!isMatch) {
            throw new error_manager_1.BadRequestError("Invalid old PIN");
        }
        const newHash = await this.hashPassword(newPin);
        return this.userRepository.setPinHash(userId, newHash);
    }
    validatePin(pin) {
        if (!/^[0-9]{4,6}$/.test(pin)) {
            throw new error_manager_1.BadRequestError("PIN must be 4-6 digits");
        }
    }
    async verifyPin(userId, pin) {
        const storedPinHash = await this.userRepository.getPinHash(userId);
        if (!storedPinHash) {
            return false;
        }
        return bcrypt_1.default.compare(pin, storedPinHash);
    }
    async setThanked(userId, thanked) {
        return this.userRepository.update(userId, { thanked });
    }
}
exports.default = UserUseCase;
//# sourceMappingURL=user.usecase.js.map