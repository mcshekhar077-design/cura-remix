import { Request, Response, NextFunction } from "express";
import { AppError } from "../shared/errors";

export function errorHandlerMiddleware(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  const requestId = req.id || "unknown";
  const timestamp = new Date().toISOString();

  // Handle known operational AppErrors
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        details: err.details,
        requestId,
        timestamp
      }
    });
    return;
  }

  // Handle Zod Validation Errors
  if (err?.name === "ZodError") {
    res.status(400).json({
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Request validation failed.",
        details: err.errors,
        requestId,
        timestamp
      }
    });
    return;
  }

  // Handle unexpected internal errors (log internally, shield internal secrets from client)
  console.error(`[INTERNAL_ERROR][${requestId}]`, err);

  const isProduction = process.env.NODE_ENV === "production";
  res.status(500).json({
    success: false,
    error: {
      code: "INTERNAL_ERROR",
      message: isProduction
        ? "An internal server error occurred. Our engineering team has been notified."
        : err.message || "An unexpected error occurred.",
      requestId,
      timestamp
    }
  });
}
