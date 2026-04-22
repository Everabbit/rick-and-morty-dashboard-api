import cron from "node-cron";
import { ensureDatabaseReady } from "../database/database.js";
import { runCharacterSync } from "../services/characterSync.service.js";

const SYNC_CRON_EXPRESSION = "*/5 * * * *";

let isSyncRunning = false;

const executeSync = async (trigger: "startup" | "cron"): Promise<void> => {
  if (isSyncRunning) {
    console.log(`[worker] Ignorando trigger ${trigger}: sync anterior ainda em execucao`);
    return;
  }

  isSyncRunning = true;

  try {
    const result = await runCharacterSync();

    console.log(
      `[worker] Sync ${trigger} finalizado: status=${result.status} fetched=${result.totalFetched} upserted=${result.totalUpserted} failed=${result.totalFailed} retries=${result.retryCount}`,
    );
  } catch (error: unknown) {
    console.error("[worker] Falha inesperada durante sync", error);
  } finally {
    isSyncRunning = false;
  }
};

const startWorker = async (): Promise<void> => {
  await ensureDatabaseReady();

  console.log("[worker] Executando sync inicial...");
  await executeSync("startup");

  cron.schedule(SYNC_CRON_EXPRESSION, async () => {
    await executeSync("cron");
  });

  console.log("[worker] Agendamento ativo a cada 5 minutos");
};

startWorker().catch((error: unknown) => {
  console.error("[worker] Falha ao iniciar worker", error);
  process.exit(1);
});
