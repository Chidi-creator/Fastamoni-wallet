export class NotFoundError extends Error {
  statusCode: number;
  constructor(message = "Resource not found") {
    super(message);
    this.name = "NotFoundError";
    this.statusCode = 404;
  }
}

export class DatabaseError extends Error {
  statusCode: number;
  constructor(message = "Database operation failed") {
    super(message);
    this.name = "DatabaseError";
    this.statusCode = 500;
  }
}

export class BadRequestError extends Error {
  statusCode: number;
  constructor(message = "Request failed") {
    super(message);
    this.name = "BadRequestError";
    this.statusCode = 400;
  }
}

export class ValidationError extends Error {
  statusCode: number;
  constructor(message = "Validation failed") {
    super(message);
    this.name = "ValidationError";
    this.statusCode = 400;
  }
}

export class UnauthorizedError extends Error {
  statusCode: number;
  constructor(message = "Unauthorized access") {
    super(message);
    this.name = "UnauthorizedError";
    this.statusCode = 401;
  }
}

export class ForbiddenError extends Error {
  statusCode: number;
  constructor(message = "Forbidden") {
    super(message);
    this.name = "ForbiddenError";
    this.statusCode = 403;
  }
}

export class ConflictError extends Error {
  statusCode: number;
  constructor(message = "Conflict detected") {
    super(message);
    this.name = "ConflictError";
    this.statusCode = 409;
  }
}

export class RateLimitExceededError extends Error {
  statusCode: number;
  constructor(message = "Rate limit exceeded") {
    super(message);
    this.name = "RateLimitExceededError";
    this.statusCode = 429;
  }
}

export class ServiceUnavailableError extends Error {
  statusCode: number;
  constructor(message = "Service unavailable") {
    super(message);
    this.name = "ServiceUnavailableError";
    this.statusCode = 503;
  }
}

export class VerificationError extends Error {
  statusCode: number;
  constructor(
    message = "Verification Error",
    public code: string,
    public details?: any
  ) {
    super(message);
    this.name = "VerificationError";
    this.statusCode = 500;
  }
}

export class ProviderError extends VerificationError {
  constructor(message = "Provider Error", details?: any) {
    super(message, "PROVIDER_ERROR", details);
    this.name = "ProviderError";
  }
}
