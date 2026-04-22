import { app } from "./app.js";
import { env } from "./config/env.js";
import { ensureDatabaseReady } from "./database/database.js";

const startServer = async (): Promise<void> => {
  await ensureDatabaseReady();

  app.listen(env.port, () => {
    console.log("API rodando na porta " + env.port);
  });
};

startServer().catch((error: unknown) => {
  console.error("Falha ao iniciar API", error);
  process.exit(1);
});
