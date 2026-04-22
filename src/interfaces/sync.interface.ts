import type { SyncStatus } from "../enums/syncStatus.enum.js";

export interface CharacterSyncResult {
  syncRunId: number;
  status: SyncStatus;
  totalFetched: number;
  totalUpserted: number;
  totalFailed: number;
  retryCount: number;
  pagesProcessed: number;
  pagesFailed: number;
  errorSummary: string | null;
}

export interface SyncRunProgress {
  totalFetched: number;
  totalUpserted: number;
  totalFailed: number;
  retryCount: number;
  errorSummary?: string | null;
}

export interface FinishSyncRunInput extends SyncRunProgress {
  status: SyncStatus;
  finishedAt: Date;
}
