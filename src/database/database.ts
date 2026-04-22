import { env } from "../config/env.js";
import { sequelize } from "./sequelize.js";
import { initModels } from "../models/index.model.js";

export const ensureDatabaseReady = async (): Promise<void> => {
  initModels();
  await sequelize.authenticate();
  await sequelize.sync({ alter: env.nodeEnv === "development" });
};
