import type { Request, Response } from "express";
import { SyncRun } from "../models/syncRun.model.js";

export const getSyncStatusController = async (req: Request, res: Response): Promise<void> => {
  const latestSyncRun = await SyncRun.findOne({
    order: [["createdAt", "DESC"]],
  });

  if (!latestSyncRun) {
    res.status(404).json({
      message: "Nenhuma sincronizacao registrada ainda",
      details: null,
    });
    return;
  }

  res.status(200).json({
    id: latestSyncRun.id,
    status: latestSyncRun.status,
    startedAt: latestSyncRun.startedAt,
    finishedAt: latestSyncRun.finishedAt,
    totalFetched: latestSyncRun.totalFetched,
    totalUpserted: latestSyncRun.totalUpserted,
    totalFailed: latestSyncRun.totalFailed,
    retryCount: latestSyncRun.retryCount,
    errorSummary: latestSyncRun.errorSummary,
    createdAt: latestSyncRun.createdAt,
    updatedAt: latestSyncRun.updatedAt,
  });
};
