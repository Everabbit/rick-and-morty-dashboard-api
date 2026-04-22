import { env } from "../config/env.js";
import type { CharacterPageFetchResult, FetchCharactersResult } from "../interfaces/rickAndMortyClient.interface.js";
import type { RickAndMortyCharacter, RickAndMortyCharacterPageResponse } from "../interfaces/rickAndMortyApi.interface.js";

const RETRYABLE_STATUS_CODES = new Set([408, 429, 500, 502, 503, 504]);

class NonRetryableHttpError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NonRetryableHttpError";
  }
}

const sleep = async (ms: number): Promise<void> => {
  await new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};

const randomJitter = (): number => {
  if (env.rickAndMorty.jitterMs <= 0) {
    return 0;
  }

  return Math.floor(Math.random() * (env.rickAndMorty.jitterMs + 1));
};

const retryDelayMs = (attempt: number): number => {
  const exponentialDelay = env.rickAndMorty.baseDelayMs * 2 ** attempt;
  return exponentialDelay + randomJitter();
};

const isRetryableStatus = (statusCode: number): boolean => {
  return RETRYABLE_STATUS_CODES.has(statusCode);
};

const fetchJsonWithRetry = async <T>(url: string): Promise<{ data: T; retries: number }> => {
  let attempt = 0;

  while (true) {
    const controller = new AbortController();
    const timeoutHandle = setTimeout(() => {
      controller.abort();
    }, env.rickAndMorty.timeoutMs);

    try {
      const response = await fetch(url, {
        method: "GET",
        signal: controller.signal,
      });

      if (!response.ok) {
        if (attempt < env.rickAndMorty.maxRetries && isRetryableStatus(response.status)) {
          const delay = retryDelayMs(attempt);
          attempt += 1;
          await sleep(delay);
          continue;
        }

        throw new NonRetryableHttpError(`Falha na API externa: status ${response.status} em ${url}`);
      }

      const data = (await response.json()) as T;
      return { data, retries: attempt };
    } catch (error: unknown) {
      if (error instanceof NonRetryableHttpError) {
        throw error;
      }

      if (attempt >= env.rickAndMorty.maxRetries) {
        throw error;
      }

      const delay = retryDelayMs(attempt);
      attempt += 1;
      await sleep(delay);
    } finally {
      clearTimeout(timeoutHandle);
    }
  }
};

const buildCharactersPageUrl = (page: number): string => {
  return `${env.rickAndMorty.baseUrl}/character?page=${page}`;
};

export const waitInterPageDelay = async (): Promise<void> => {
  if (env.rickAndMorty.interPageDelayMs <= 0) {
    return;
  }

  await sleep(env.rickAndMorty.interPageDelayMs);
};

export const fetchCharacterPage = async (page: number): Promise<CharacterPageFetchResult> => {
  const url = buildCharactersPageUrl(page);
  const { data, retries } = await fetchJsonWithRetry<RickAndMortyCharacterPageResponse>(url);

  return {
    page,
    retries,
    data,
  };
};
