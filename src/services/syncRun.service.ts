import { SyncStatus } from "../enums/syncStatus.enum.js";
import type { FinishSyncRunInput, SyncRunProgress } from "../interfaces/sync.interface.js";
import { SyncRun } from "../models/syncRun.model.js";

export const createSyncRun = async (): Promise<SyncRun> => {
  return SyncRun.create({
    startedAt: new Date(),
    finishedAt: null,
    status: SyncStatus.RUNNING,
    totalFetched: 0,
    totalUpserted: 0,
    totalFailed: 0,
    retryCount: 0,
    errorSummary: null,
  });
};

export const updateSyncRunProgress = async (syncRunId: number, progress: SyncRunProgress): Promise<void> => {
  await SyncRun.update(
    {
      totalFetched: progress.totalFetched,
      totalUpserted: progress.totalUpserted,
      totalFailed: progress.totalFailed,
      retryCount: progress.retryCount,
      errorSummary: progress.errorSummary ?? null,
    },
    {
      where: { id: syncRunId },
    },
  );
};

export const finishSyncRun = async (syncRunId: number, input: FinishSyncRunInput): Promise<void> => {
  await SyncRun.update(
    {
      status: input.status,
      finishedAt: input.finishedAt,
      totalFetched: input.totalFetched,
      totalUpserted: input.totalUpserted,
      totalFailed: input.totalFailed,
      retryCount: input.retryCount,
      errorSummary: input.errorSummary ?? null,
    },
    {
      where: { id: syncRunId },
    },
  );
};
