"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserHandler = void 0;
const constants_1 = require("../config/constants");
const index_1 = require("../managers/index");
const wallet_service_1 = __importDefault(require("../services/wallet.service"));
const user_usecase_1 = __importDefault(require("../usecases/user.usecase"));
const user_1 = require("../validation/user");
const wallet_jobs_1 = require("../engine/jobs/wallet.jobs");
class UserHandler {
    constructor() {
        this.handleCreateUser = async (req, res) => {
            try {
                const data = req.body;
                const { error } = (0, user_1.validateUserCreation)(data);
                if (error) {
                    return index_1.responseManager.validationError(res, error.details[0].message);
                }
                const newUser = await this.userUsecase.createUser(data);
                const walletData = {
                    email: newUser.email,
                    firstname: newUser.firstname,
                    lastname: newUser.lastname,
                    currency: "NGN",
                    bank_code: "044", // Access bank code as default
                    bvn: "22222222222", // Dummy BVN for now,
                    is_permanent: true,
                };
                await (0, wallet_jobs_1.addWalletJobs)(constants_1.JOBS.CREATE_USER_WALLET, {
                    userId: newUser.id,
                    walletData,
                });
                return index_1.responseManager.success(res, { user: newUser }, "User created successfully", 201);
            }
            catch (error) {
                return index_1.responseManager.handleError(res, error);
            }
        };
        this.userUsecase = new user_usecase_1.default();
        this.walletService = new wallet_service_1.default();
    }
}
exports.UserHandler = UserHandler;
exports.default = UserHandler;
//# sourceMappingURL=user.handler.js.map