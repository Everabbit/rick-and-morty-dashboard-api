import type { NextFunction, Request, Response } from "express";
import { CharacterGender } from "../enums/characterGender.enum.js";
import { CharacterStatus } from "../enums/characterStatus.enum.js";
import type { CharacterFilters, CharacterListQuery, CharacterSortField, CharacterSortOrder } from "../interfaces/characterFilters.interface.js";
import { createApiError } from "./errorHandler.middleware.js";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;
const DEFAULT_SORT_BY: CharacterSortField = "externalId";
const DEFAULT_SORT_ORDER: CharacterSortOrder = "ASC";
const ALLOWED_STATUS_VALUES = new Set<number>([CharacterStatus.ALIVE, CharacterStatus.DEAD, CharacterStatus.UNKNOWN]);
const ALLOWED_GENDER_VALUES = new Set<number>([CharacterGender.FEMALE, CharacterGender.MALE, CharacterGender.GENDERLESS, CharacterGender.UNKNOWN]);

const ALLOWED_SORT_FIELDS: CharacterSortField[] = [
  "externalId",
  "name",
  "status",
  "species",
  "gender",
  "originName",
  "locationName",
  "type",
  "episodeCount",
  "lastSyncedAt",
  "updatedAt",
];

const parseInteger = (raw: string): number | null => {
  const value = Number(raw);
  if (!Number.isInteger(value)) {
    return null;
  }

  return value;
};

const parseOptionalText = (raw: string | undefined): string | undefined => {
  if (!raw) {
    return undefined;
  }

  const value = raw.trim();
  if (!value) {
    return undefined;
  }

  return value;
};

const parseOptionalInteger = (raw: string | undefined): number | undefined => {
  if (!raw) {
    return undefined;
  }

  const parsed = parseInteger(raw);
  if (parsed === null) {
    return undefined;
  }

  return parsed;
};

const parseOptionalEnum = (raw: string | undefined, fieldName: string, allowedValues: Set<number>, next: NextFunction): number | undefined => {
  const parsed = parseOptionalInteger(raw);
  if (parsed === undefined) {
    return undefined;
  }

  if (!allowedValues.has(parsed)) {
    next(createApiError(400, `Parametro ${fieldName} invalido`, `Valores permitidos: ${Array.from(allowedValues).join(", ")}`));
    return undefined;
  }

  return parsed;
};

const parseOptionalNonNegativeInteger = (raw: string | undefined, fieldName: string, next: NextFunction): number | undefined => {
  if (!raw) {
    return undefined;
  }

  const parsed = parseInteger(raw);
  if (parsed === null || parsed < 0) {
    next(createApiError(400, `Parametro ${fieldName} invalido`, "Use um inteiro maior ou igual a zero"));
    return undefined;
  }

  return parsed;
};

const parseSortBy = (raw: string | undefined, next: NextFunction): CharacterSortField => {
  if (!raw) {
    return DEFAULT_SORT_BY;
  }

  const value = raw.trim() as CharacterSortField;
  if (!ALLOWED_SORT_FIELDS.includes(value)) {
    next(createApiError(400, "Parametro sortBy invalido", `Campos permitidos: ${ALLOWED_SORT_FIELDS.join(", ")}`));
    return DEFAULT_SORT_BY;
  }

  return value;
};

const parseSortOrder = (raw: string | undefined, next: NextFunction): CharacterSortOrder => {
  if (!raw) {
    return DEFAULT_SORT_ORDER;
  }

  const value = raw.trim().toUpperCase();
  if (value !== "ASC" && value !== "DESC") {
    next(createApiError(400, "Parametro sortOrder invalido", "Use ASC ou DESC"));
    return DEFAULT_SORT_ORDER;
  }

  return value;
};

export const validatePaginationQueryMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const pageRaw = req.query.page as string | undefined;
  const limitRaw = req.query.limit as string | undefined;

  let page = DEFAULT_PAGE;
  let limit = DEFAULT_LIMIT;

  const status = parseOptionalEnum(req.query.status as string | undefined, "status", ALLOWED_STATUS_VALUES, next);
  if (req.query.status && status === undefined) {
    return;
  }

  const gender = parseOptionalEnum(req.query.gender as string | undefined, "gender", ALLOWED_GENDER_VALUES, next);
  if (req.query.gender && gender === undefined) {
    return;
  }

  const filters: CharacterFilters = {};

  const name = parseOptionalText(req.query.name as string | undefined);
  if (name !== undefined) {
    filters.name = name;
  }

  if (status !== undefined) {
    filters.status = status as CharacterStatus;
  }

  const species = parseOptionalText(req.query.species as string | undefined);
  if (species !== undefined) {
    filters.species = species;
  }

  if (gender !== undefined) {
    filters.gender = gender as CharacterGender;
  }

  const originName = parseOptionalText(req.query.originName as string | undefined);
  if (originName !== undefined) {
    filters.originName = originName;
  }

  const locationName = parseOptionalText(req.query.locationName as string | undefined);
  if (locationName !== undefined) {
    filters.locationName = locationName;
  }

  const type = parseOptionalText(req.query.type as string | undefined);
  if (type !== undefined) {
    filters.type = type;
  }

  if (pageRaw) {
    const parsedPage = parseInteger(pageRaw);
    if (!parsedPage || parsedPage <= 0) {
      next(createApiError(400, "Parametro page invalido", "Use um inteiro positivo"));
      return;
    }

    page = parsedPage;
  }

  if (limitRaw) {
    const parsedLimit = parseInteger(limitRaw);
    if (!parsedLimit || parsedLimit <= 0) {
      next(createApiError(400, "Parametro limit invalido", "Use um inteiro positivo"));
      return;
    }

    if (parsedLimit > MAX_LIMIT) {
      next(createApiError(400, "Parametro limit invalido", `Valor maximo permitido: ${MAX_LIMIT}`));
      return;
    }

    limit = parsedLimit;
  }

  const episodeCountMin = parseOptionalNonNegativeInteger(req.query.episodeCountMin as string | undefined, "episodeCountMin", next);
  if (episodeCountMin === undefined && req.query.episodeCountMin) {
    return;
  }

  const episodeCountMax = parseOptionalNonNegativeInteger(req.query.episodeCountMax as string | undefined, "episodeCountMax", next);
  if (episodeCountMax === undefined && req.query.episodeCountMax) {
    return;
  }

  if (episodeCountMin !== undefined && episodeCountMax !== undefined && episodeCountMin > episodeCountMax) {
    next(createApiError(400, "Intervalo de episodeCount invalido", "episodeCountMin nao pode ser maior que episodeCountMax"));
    return;
  }

  if (episodeCountMin !== undefined) {
    filters.episodeCountMin = episodeCountMin;
  }

  if (episodeCountMax !== undefined) {
    filters.episodeCountMax = episodeCountMax;
  }

  const sortBy = parseSortBy(req.query.sortBy as string | undefined, next);
  if (req.query.sortBy && !ALLOWED_SORT_FIELDS.includes((req.query.sortBy as string).trim() as CharacterSortField)) {
    return;
  }

  const sortOrder = parseSortOrder(req.query.sortOrder as string | undefined, next);
  if (req.query.sortOrder && !["ASC", "DESC"].includes((req.query.sortOrder as string).trim().toUpperCase())) {
    return;
  }

  res.locals.characterListQuery = {
    pagination: {
      page,
      limit,
    },
    filters,
    sortBy,
    sortOrder,
  } satisfies CharacterListQuery;

  next();
};
