import { Op, type WhereOptions } from "sequelize";
import type {
  CharacterAppliedFilters,
  CharacterFilters,
  CharacterListQuery,
} from "../interfaces/characterFilters.interface.js";
import type { PaginationMeta } from "../interfaces/pagination.interface.js";
import { Character } from "../models/character.model.js";

export interface CharacterQueryResult {
  pagination: PaginationMeta;
  appliedFilters: CharacterAppliedFilters;
  data: Character[];
}

const escapeLikePattern = (value: string): string => {
  return value.replace(/[\\%_]/g, "\\$&");
};

const addContainsFilter = (
  where: Record<string, unknown>,
  key: "name" | "species" | "originName" | "locationName" | "type",
  value: string | undefined,
): void => {
  if (!value) {
    return;
  }

  where[key] = {
    [Op.iLike]: `%${escapeLikePattern(value)}%`,
  };
};

const addExactFilter = (
  where: Record<string, unknown>,
  key: "status" | "gender",
  value: number | undefined,
): void => {
  if (value === undefined) {
    return;
  }

  where[key] = value;
};

const addEpisodeCountRangeFilter = (
  where: Record<string, unknown>,
  filters: CharacterFilters,
): void => {
  if (filters.episodeCountMin === undefined && filters.episodeCountMax === undefined) {
    return;
  }

  const range: Record<symbol, number> = {};

  if (filters.episodeCountMin !== undefined) {
    range[Op.gte] = filters.episodeCountMin;
  }

  if (filters.episodeCountMax !== undefined) {
    range[Op.lte] = filters.episodeCountMax;
  }

  where.episodeCount = range;
};

const buildWhere = (filters: CharacterFilters): Record<string, unknown> => {
  const where: Record<string, unknown> = {};

  addContainsFilter(where, "name", filters.name);
  addContainsFilter(where, "species", filters.species);
  addContainsFilter(where, "originName", filters.originName);
  addContainsFilter(where, "locationName", filters.locationName);
  addContainsFilter(where, "type", filters.type);

  addExactFilter(where, "status", filters.status);
  addExactFilter(where, "gender", filters.gender);

  addEpisodeCountRangeFilter(where, filters);

  return where;
};

export const listCharactersQuery = async (
  query: CharacterListQuery,
): Promise<CharacterQueryResult> => {
  const where = buildWhere(query.filters);
  const offset = (query.pagination.page - 1) * query.pagination.limit;

  const { count, rows } = await Character.findAndCountAll({
    where: where as WhereOptions,
    order: [[query.sortBy, query.sortOrder]],
    limit: query.pagination.limit,
    offset,
  });

  const totalPages = Math.ceil(count / query.pagination.limit) || 1;

  return {
    pagination: {
      page: query.pagination.page,
      limit: query.pagination.limit,
      totalItems: count,
      totalPages,
      hasNextPage: query.pagination.page < totalPages,
      hasPreviousPage: query.pagination.page > 1,
    },
    appliedFilters: {
      ...query.filters,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
    },
    data: rows,
  };
};