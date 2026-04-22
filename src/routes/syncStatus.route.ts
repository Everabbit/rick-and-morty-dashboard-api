import { Router } from "express";
import { getSyncStatusController } from "../controllers/syncStatus.controller.js";
import { asyncHandlerMiddleware } from "../middlewares/asyncHandler.middleware.js";

export const syncStatusRouter = Router();

syncStatusRouter.get("/api/sync/status", asyncHandlerMiddleware(getSyncStatusController));