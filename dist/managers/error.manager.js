"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProviderError = exports.VerificationError = exports.ServiceUnavailableError = exports.RateLimitExceededError = exports.ConflictError = exports.ForbiddenError = exports.UnauthorizedError = exports.ValidationError = exports.BadRequestError = exports.DatabaseError = exports.NotFoundError = void 0;
class NotFoundError extends Error {
    constructor(message = "Resource not found") {
        super(message);
        this.name = "NotFoundError";
        this.statusCode = 404;
    }
}
exports.NotFoundError = NotFoundError;
class DatabaseError extends Error {
    constructor(message = "Database operation failed") {
        super(message);
        this.name = "DatabaseError";
        this.statusCode = 500;
    }
}
exports.DatabaseError = DatabaseError;
class BadRequestError extends Error {
    constructor(message = "Request failed") {
        super(message);
        this.name = "BadRequestError";
        this.statusCode = 400;
    }
}
exports.BadRequestError = BadRequestError;
class ValidationError extends Error {
    constructor(message = "Validation failed") {
        super(message);
        this.name = "ValidationError";
        this.statusCode = 400;
    }
}
exports.ValidationError = ValidationError;
class UnauthorizedError extends Error {
    constructor(message = "Unauthorized access") {
        super(message);
        this.name = "UnauthorizedError";
        this.statusCode = 401;
    }
}
exports.UnauthorizedError = UnauthorizedError;
class ForbiddenError extends Error {
    constructor(message = "Forbidden") {
        super(message);
        this.name = "ForbiddenError";
        this.statusCode = 403;
    }
}
exports.ForbiddenError = ForbiddenError;
class ConflictError extends Error {
    constructor(message = "Conflict detected") {
        super(message);
        this.name = "ConflictError";
        this.statusCode = 409;
    }
}
exports.ConflictError = ConflictError;
class RateLimitExceededError extends Error {
    constructor(message = "Rate limit exceeded") {
        super(message);
        this.name = "RateLimitExceededError";
        this.statusCode = 429;
    }
}
exports.RateLimitExceededError = RateLimitExceededError;
class ServiceUnavailableError extends Error {
    constructor(message = "Service unavailable") {
        super(message);
        this.name = "ServiceUnavailableError";
        this.statusCode = 503;
    }
}
exports.ServiceUnavailableError = ServiceUnavailableError;
class VerificationError extends Error {
    constructor(message = "Verification Error", code, details) {
        super(message);
        this.code = code;
        this.details = details;
        this.name = "VerificationError";
        this.statusCode = 500;
    }
}
exports.VerificationError = VerificationError;
class ProviderError extends VerificationError {
    constructor(message = "Provider Error", details) {
        super(message, "PROVIDER_ERROR", details);
        this.name = "ProviderError";
    }
}
exports.ProviderError = ProviderError;
//# sourceMappingURL=error.manager.js.map