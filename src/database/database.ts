import { sequelize } from "./sequelize.js";
import { initModels } from "../models/index.model.js";
import { env } from "../config/env.js";

export const ensureDatabaseReady = async (): Promise<void> => {
  initModels();
  await sequelize.authenticate();

  if (env.db.autoSync) {
    await sequelize.sync();
  }
};
