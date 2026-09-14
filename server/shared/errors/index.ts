export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly isOperational: boolean;
  public readonly details?: any;

  constructor(message: string, statusCode = 500, code = "INTERNAL_ERROR", details?: any) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Authentication required. Valid credentials or session token must be provided.") {
    super(message, 401, "UNAUTHORIZED");
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Access denied. Insufficient permissions or tenant boundary violation.") {
    super(message, 403, "FORBIDDEN");
  }
}

export class NotFoundError extends AppError {
  constructor(resource = "Resource", identifier?: string) {
    super(`${resource}${identifier ? ` with identifier '${identifier}'` : ""} was not found.`, 404, "NOT_FOUND");
  }
}

export class ValidationError extends AppError {
  constructor(message = "Validation failed for request parameters or body.", details?: any) {
    super(message, 400, "VALIDATION_ERROR", details);
  }
}

export class ConflictError extends AppError {
  constructor(message = "Resource conflict detected. Version mismatch or duplicate entry.") {
    super(message, 409, "CONFLICT");
  }
}

export class RateLimitError extends AppError {
  constructor(message = "Rate limit exceeded. Please throttle your requests.") {
    super(message, 429, "RATE_LIMITED");
  }
}

export class ClinicalSafetyError extends AppError {
  constructor(message = "Clinical safety constraint triggered. Clinical review or contraindication check failed.") {
    super(message, 422, "CLINICAL_SAFETY_VIOLATION");
  }
}

export class ServiceUnavailableError extends AppError {
  constructor(service = "External service") {
    super(`${service} is temporarily unavailable. Safe failure mode engaged.`, 503, "SERVICE_UNAVAILABLE");
  }
}
