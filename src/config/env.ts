import dotenv from "dotenv";

dotenv.config();

const numberWithDefault = (rawValue: string | undefined, fallback: number): number => {
  if (!rawValue) {
    return fallback;
  }

  const value = Number(rawValue);
  if (Number.isNaN(value) || value < 0) {
    throw new Error(`Valor inválido para configuração numérica: ${rawValue}`);
  }

  return value;
};

const textWithDefault = (rawValue: string | undefined, fallback: string): string => {
  if (!rawValue) {
    return fallback;
  }

  return rawValue.trim();
};

const booleanWithDefault = (rawValue: string | undefined, fallback: boolean): boolean => {
  if (!rawValue) {
    return fallback;
  }

  const value = rawValue.trim().toLowerCase();
  if (value === "true" || value === "1") {
    return true;
  }

  if (value === "false" || value === "0") {
    return false;
  }

  throw new Error(`Valor invalido para configuracao booleana: ${rawValue}`);
};

export const env = {
  nodeEnv: textWithDefault(process.env.NODE_ENV, "development"),
  port: numberWithDefault(process.env.PORT, 3000),
  db: {
    host: textWithDefault(process.env.DB_HOST, "localhost"),
    port: numberWithDefault(process.env.DB_PORT, 5432),
    user: textWithDefault(process.env.DB_USER, "postgres"),
    password: textWithDefault(process.env.DB_PASSWORD, ""),
    name: textWithDefault(process.env.DB_NAME, "rick_and_morty"),
    autoSync: booleanWithDefault(process.env.DB_AUTO_SYNC, true),
  },
  rickAndMorty: {
    baseUrl: textWithDefault(process.env.RICK_AND_MORTY_API_BASE_URL, "https://rickandmortyapi.com/api"),
    maxRetries: numberWithDefault(process.env.RICK_AND_MORTY_MAX_RETRIES, 4),
    baseDelayMs: numberWithDefault(process.env.RICK_AND_MORTY_RETRY_BASE_DELAY_MS, 500),
    jitterMs: numberWithDefault(process.env.RICK_AND_MORTY_RETRY_JITTER_MS, 200),
    interPageDelayMs: numberWithDefault(process.env.RICK_AND_MORTY_INTER_PAGE_DELAY_MS, 300),
    timeoutMs: numberWithDefault(process.env.RICK_AND_MORTY_TIMEOUT_MS, 10000),
  },
};
