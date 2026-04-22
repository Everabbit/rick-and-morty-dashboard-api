import { Router } from "express";
import { listCharactersController } from "../controllers/characters.controller.js";
import { asyncHandlerMiddleware } from "../middlewares/asyncHandler.middleware.js";
import { validatePaginationQueryMiddleware } from "../middlewares/validatePaginationQuery.middleware.js";

export const charactersRouter = Router();

charactersRouter.get(
  "/api/characters",
  validatePaginationQueryMiddleware,
  asyncHandlerMiddleware(listCharactersController),
);