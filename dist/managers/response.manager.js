"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const error_manager_1 = require("./error.manager");
class ResponseManager {
    success(res, data, message = "Operation successful", statusCode = 200, meta = null) {
        const response = {
            success: true,
            status: statusCode,
            message,
            data,
            timestamp: new Date().toISOString(),
        };
        if (meta) {
            response.meta = meta;
        }
        res.status(statusCode).json(response);
    }
    error(res, message = "An error occurred", statusCode = 400, details = null) {
        const response = {
            success: true,
            status: statusCode,
            message,
            timestamp: new Date().toISOString(),
        };
        if (!details) {
            delete response.details;
        }
        res.status(statusCode).json(response);
    }
    validationError(res, errors, message = "Validation failed", statusCode = 400) {
        const response = {
            success: false,
            status: statusCode,
            message,
            errors, // Pass the validation errors (array or object)
            timestamp: new Date().toISOString(),
        };
        res.status(statusCode).json(response);
    }
    paginate(res, data, totalCount, currentPage, itemsPerPage, message = "Operation successful", statusCode = 200) {
        const response = {
            success: true,
            status: statusCode,
            message,
            data,
            pagination: {
                totalItems: totalCount,
                currentPage,
                itemsPerPage,
                totalPages: Math.ceil(totalCount / itemsPerPage),
            },
            timestamp: new Date().toISOString(),
        };
        res.status(statusCode).json(response);
    }
    unauthorized(res, message = "Unauthorized access", statusCode = 401) {
        const response = {
            success: false,
            status: statusCode,
            message,
            timestamp: new Date().toISOString(),
        };
        res.status(statusCode).json(response);
    }
    forbidden(res, message = "Forbidden", statusCode = 403) {
        const response = {
            success: false,
            status: statusCode,
            message,
            timestamp: new Date().toISOString(),
        };
        res.status(statusCode).json(response);
    }
    notFound(res, message = "Resource not found", statusCode = 404) {
        const response = {
            success: false,
            status: statusCode,
            message,
            timestamp: new Date().toISOString(),
        };
        res.status(statusCode).json(response);
    }
    conflict(res, message = "Conflict detected", statusCode = 409) {
        res.status(statusCode).json({
            success: false,
            status: statusCode,
            message,
            timestamp: new Date().toISOString(),
        });
    }
    internalError(res, message = "Internal server error", statusCode = 500) {
        res.status(statusCode).json({
            success: false,
            status: statusCode,
            message,
            timestamp: new Date().toISOString(),
        });
    }
    rateLimitExceeded(res, message = "Rate limit exceeded", statusCode = 429) {
        res.status(statusCode).json({
            success: false,
            status: statusCode,
            message,
            timestamp: new Date().toISOString(),
        });
    }
    serviceUnavailable(res, message = "Service unavailable", statusCode = 503) {
        res.status(statusCode).json({
            success: false,
            status: statusCode,
            message,
            timestamp: new Date().toISOString(),
        });
    }
    handleError(res, error) {
        if (error instanceof error_manager_1.NotFoundError) {
            return this.notFound(res, error.message);
        }
        else if (error instanceof error_manager_1.DatabaseError) {
            return this.internalError(res, error.message);
        }
        else if (error instanceof error_manager_1.ValidationError) {
            return this.validationError(res, error.message);
        }
        else if (error instanceof error_manager_1.UnauthorizedError) {
            return this.unauthorized(res, error.message);
        }
        else if (error instanceof error_manager_1.ForbiddenError) {
            return this.forbidden(res, error.message);
        }
        else if (error instanceof error_manager_1.ConflictError) {
            return this.conflict(res, error.message);
        }
        else if (error instanceof error_manager_1.RateLimitExceededError) {
            return this.rateLimitExceeded(res, error.message);
        }
        else if (error instanceof error_manager_1.ServiceUnavailableError) {
            return this.serviceUnavailable(res, error.message);
        }
        else {
            return this.internalError(res, error?.message);
        }
    }
}
exports.default = ResponseManager;
//# sourceMappingURL=response.manager.js.map