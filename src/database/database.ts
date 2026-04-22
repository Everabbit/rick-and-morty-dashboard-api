import { sequelize } from "./sequelize.js";
import { initModels } from "../models/index.model.js";

export const ensureDatabaseReady = async (): Promise<void> => {
  initModels();
  await sequelize.authenticate();
};
