import type { ErrorRequestHandler, RequestHandler } from "express";
import mongoose from "mongoose";
import { ZodError, z } from "zod";
import { AppError } from "../utils/AppError.js";
import { env } from "../config/env.js";

export const notFound: RequestHandler = (req, _res, next) => {
  next(AppError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
};

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ success: false, message: err.message, details: err.details });
    return;
  }
  if (err instanceof ZodError) {
    res.status(400).json({ success: false, message: "Validation failed", details: z.flattenError(err).fieldErrors });
    return;
  }
  if (err instanceof mongoose.Error.CastError) {
    res.status(400).json({ success: false, message: `Invalid ${err.path}` });
    return;
  }
  if (err instanceof mongoose.Error.ValidationError) {
    res.status(400).json({ success: false, message: err.message });
    return;
  }
  if (typeof err === "object" && err !== null && "code" in err && err.code === 11000) {
    const fields = Object.keys((err as { keyValue?: object }).keyValue ?? {}).join(", ");
    res.status(409).json({ success: false, message: `Already exists: ${fields}` });
    return;
  }

  console.error(err);
  res.status(500).json({
    success: false,
    message: env.NODE_ENV === "production" ? "Internal server error" : String(err?.message ?? err),
  });
};
