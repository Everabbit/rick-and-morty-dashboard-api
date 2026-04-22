import { sequelize } from "../database/sequelize.js";
import { initCharacterModel } from "./character.model.js";
import { initSyncRunModel } from "./syncRun.model.js";

let initialized = false;

export const initModels = (): void => {
  if (initialized) {
    return;
  }

  initCharacterModel(sequelize);
  initSyncRunModel(sequelize);

  initialized = true;
};
