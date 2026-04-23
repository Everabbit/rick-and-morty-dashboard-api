import express from "express";
import cors from "cors";
import { healthRouter } from "./routes/health.route.js";
import { charactersRouter } from "./routes/characters.route.js";
import { syncStatusRouter } from "./routes/syncStatus.route.js";
import { apiRateLimitMiddleware } from "./middlewares/apiRateLimit.middleware.js";
import { errorHandlerMiddleware } from "./middlewares/errorHandler.middleware.js";

export const app = express();

app.set("trust proxy", 1);

app.use(
  cors({
    origin: [
      "http://localhost:9000", // dev quasar
      "https://rick-and-morty-dashboard-front.vercel.app",
    ],
    credentials: true,
  }),
);
app.use(express.json());
app.use("/api", apiRateLimitMiddleware);
app.use(healthRouter);
app.use(charactersRouter);
app.use(syncStatusRouter);
app.use(errorHandlerMiddleware);
