import type { NextFunction, Request, Response } from "express";
import type { ApiError } from "../interfaces/apiError.interface.js";

const isApiError = (error: unknown): error is ApiError => {
  if (!error || typeof error !== "object") {
    return false;
  }

  return (
    "statusCode" in error &&
    typeof (error as { statusCode: unknown }).statusCode === "number" &&
    "message" in error &&
    typeof (error as { message: unknown }).message === "string"
  );
};

export const createApiError = (
  statusCode: number,
  message: string,
  details?: unknown,
): ApiError => {
  return {
    statusCode,
    message,
    details,
  };
};

export const errorHandlerMiddleware = (
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  if (isApiError(error)) {
    res.status(error.statusCode).json({
      message: error.message,
      details: error.details ?? null,
    });
    return;
  }

  if (error instanceof Error) {
    res.status(500).json({
      message: "Erro interno no servidor",
      details: error.message,
    });
    return;
  }

  res.status(500).json({
    message: "Erro interno no servidor",
    details: null,
  });
};
