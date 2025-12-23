import { Response } from "express";
import {
  DatabaseError,
  ConflictError,
  NotFoundError,
  ForbiddenError,
  ValidationError,
  UnauthorizedError,
  RateLimitExceededError,
  ServiceUnavailableError,
} from "./error.manager";
import { SuccessResponse, ErrorResponse } from "./types/response.d";

class ResponseManager {
  success(
    res: Response,
    data: Array<any> | object,
    message = "Operation successful",
    statusCode = 200,
    meta = null
  ) {
    const response: SuccessResponse = {
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

  error(
    res: Response,
    message = "An error occurred",
    statusCode = 400,
    details = null
  ) {
    const response: ErrorResponse = {
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


  validationError(
    res: Response,
    errors: Array<any> | object | string,
    message = "Validation failed",
    statusCode = 400
  ) {
    const response: ErrorResponse = {
      success: false,
      status: statusCode,
      message,
      errors, // Pass the validation errors (array or object)
      timestamp: new Date().toISOString(),
    };

    res.status(statusCode).json(response);
  }


  paginate(
    res: Response,
    data: Array<any> | object,
    totalCount: number,
    currentPage: number,
    itemsPerPage: number,
    message = "Operation successful",
    statusCode = 200
  ) {
    const response: SuccessResponse = {
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


  unauthorized(
    res: Response,
    message = "Unauthorized access",
    statusCode = 401
  ) {
    const response: ErrorResponse = {
      success: false,
      status: statusCode,
      message,
      timestamp: new Date().toISOString(),
    };

    res.status(statusCode).json(response);
  }

 
  forbidden(res: Response, message = "Forbidden", statusCode = 403) {
    const response: ErrorResponse = {
      success: false,
      status: statusCode,
      message,
      timestamp: new Date().toISOString(),
    };

    res.status(statusCode).json(response);
  }

 
  notFound(res: Response, message = "Resource not found", statusCode = 404) {
    const response: ErrorResponse = {
      success: false,
      status: statusCode,
      message,
      timestamp: new Date().toISOString(),
    };

    res.status(statusCode).json(response);
  }

 
  conflict(res: Response, message = "Conflict detected", statusCode = 409) {
    res.status(statusCode).json({
      success: false,
      status: statusCode,
      message,
      timestamp: new Date().toISOString(),
    });
  }

  internalError(
    res: Response,
    message = "Internal server error",
    statusCode = 500
  ) {
    res.status(statusCode).json({
      success: false,
      status: statusCode,
      message,
      timestamp: new Date().toISOString(),
    });
  }

  rateLimitExceeded(
    res: Response,
    message = "Rate limit exceeded",
    statusCode = 429
  ) {
    res.status(statusCode).json({
      success: false,
      status: statusCode,
      message,
      timestamp: new Date().toISOString(),
    });
  }

  serviceUnavailable(
    res: Response,
    message = "Service unavailable",
    statusCode = 503
  ) {
    res.status(statusCode).json({
      success: false,
      status: statusCode,
      message,
      timestamp: new Date().toISOString(),
    });
  }

  handleError(res: Response, error: Error) {
    if (error instanceof NotFoundError) {
      return this.notFound(res, error.message);
    } else if (error instanceof DatabaseError) {
      return this.internalError(res, error.message);
    } else if (error instanceof ValidationError) {
      return this.validationError(res, error.message);
    } else if (error instanceof UnauthorizedError) {
      return this.unauthorized(res, error.message);
    } else if (error instanceof ForbiddenError) {
      return this.forbidden(res, error.message);
    } else if (error instanceof ConflictError) {
      return this.conflict(res, error.message);
    } else if (error instanceof RateLimitExceededError) {
      return this.rateLimitExceeded(res, error.message);
    } else if (error instanceof ServiceUnavailableError) {
      return this.serviceUnavailable(res, error.message);
    } else {
      return this.internalError(res, error?.message);
    }
  }
}

export default ResponseManager;
