import { SyncStatus } from "../enums/syncStatus.enum.js";
import type { CharacterSyncResult } from "../interfaces/sync.interface.js";
import type { SanitizedCharacter } from "../interfaces/rickAndMortyApi.interface.js";
import { Character } from "../models/character.model.js";
import { sanitizeCharacters } from "./characterSanitizer.service.js";
import { fetchCharacterPage, waitInterPageDelay } from "./rickAndMortyClient.service.js";
import { createSyncRun, finishSyncRun, updateSyncRunProgress } from "./syncRun.service.js";

interface UpsertSummary {
  upserted: number;
  failed: number;
  errors: string[];
}

interface SyncCounters {
  totalFetched: number;
  totalUpserted: number;
  totalFailed: number;
  retryCount: number;
  pagesProcessed: number;
  pagesFailed: number;
}

const summarizeErrors = (errors: string[]): string | null => {
  if (errors.length === 0) {
    return null;
  }

  if (errors.length <= 5) {
    return errors.join(" | ");
  }

  return `${errors.slice(0, 5).join(" | ")} | ... +${errors.length - 5} erros`;
};

const upsertCharacters = async (characters: SanitizedCharacter[]): Promise<UpsertSummary> => {
  let upserted = 0;
  let failed = 0;
  const errors: string[] = [];

  for (const character of characters) {
    try {
      await Character.upsert(
        {
          externalId: character.externalId,
          name: character.name,
          status: character.status,
          species: character.species,
          type: character.type,
          gender: character.gender,
          originName: character.originName,
          locationName: character.locationName,
          image: character.image,
          episodeCount: character.episodeCount,
          lastSyncedAt: character.lastSyncedAt,
        },
        {
          returning: false,
        },
      );

      upserted += 1;
    } catch (error: unknown) {
      failed += 1;
      const message = error instanceof Error ? error.message : "Erro desconhecido ao fazer upsert";
      errors.push(`externalId=${character.externalId}: ${message}`);
    }
  }

  return { upserted, failed, errors };
};

const updateProgress = async (syncRunId: number, counters: SyncCounters, errors: string[]): Promise<void> => {
  await updateSyncRunProgress(syncRunId, {
    totalFetched: counters.totalFetched,
    totalUpserted: counters.totalUpserted,
    totalFailed: counters.totalFailed,
    retryCount: counters.retryCount,
    errorSummary: summarizeErrors(errors),
  });
};

export const runCharacterSync = async (): Promise<CharacterSyncResult> => {
  const syncRun = await createSyncRun();
  const syncedAt = new Date();
  const errors: string[] = [];

  const counters: SyncCounters = {
    totalFetched: 0,
    totalUpserted: 0,
    totalFailed: 0,
    retryCount: 0,
    pagesProcessed: 0,
    pagesFailed: 0,
  };

  let finalStatus = SyncStatus.SUCCESS;

  try {
    const firstPage = await fetchCharacterPage(1);
    const totalPages = firstPage.data.info.pages;

    for (let page = 1; page <= totalPages; page += 1) {
      try {
        if (page > 1) {
          await waitInterPageDelay();
        }

        const pageData = page === 1 ? firstPage : await fetchCharacterPage(page);
        counters.retryCount += pageData.retries;
        counters.pagesProcessed += 1;

        const sanitizedCharacters = sanitizeCharacters(pageData.data.results, syncedAt);
        counters.totalFetched += sanitizedCharacters.length;

        const upsertSummary = await upsertCharacters(sanitizedCharacters);
        counters.totalUpserted += upsertSummary.upserted;
        counters.totalFailed += upsertSummary.failed;

        if (upsertSummary.errors.length > 0) {
          errors.push(...upsertSummary.errors.map((err) => `page=${page}: ${err}`));
        }
      } catch (error: unknown) {
        counters.pagesFailed += 1;
        counters.totalFailed += 1;
        const message = error instanceof Error ? error.message : "Erro desconhecido ao processar página";
        errors.push(`page=${page}: ${message}`);
      }

      await updateProgress(syncRun.id, counters, errors);
    }

    if (counters.pagesFailed > 0 || counters.totalFailed > 0) {
      finalStatus = SyncStatus.PARTIAL;
    }
  } catch (error: unknown) {
    finalStatus = SyncStatus.FAILED;
    counters.totalFailed += 1;
    const message = error instanceof Error ? error.message : "Erro desconhecido ao iniciar sync";
    errors.push(`startup: ${message}`);

    await updateProgress(syncRun.id, counters, errors);
  }

  const errorSummary = summarizeErrors(errors);

  await finishSyncRun(syncRun.id, {
    status: finalStatus,
    finishedAt: new Date(),
    totalFetched: counters.totalFetched,
    totalUpserted: counters.totalUpserted,
    totalFailed: counters.totalFailed,
    retryCount: counters.retryCount,
    errorSummary,
  });

  return {
    syncRunId: syncRun.id,
    status: finalStatus,
    totalFetched: counters.totalFetched,
    totalUpserted: counters.totalUpserted,
    totalFailed: counters.totalFailed,
    retryCount: counters.retryCount,
    pagesProcessed: counters.pagesProcessed,
    pagesFailed: counters.pagesFailed,
    errorSummary,
  };
};
