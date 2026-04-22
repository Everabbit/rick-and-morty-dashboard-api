import type { CharacterGender } from "../enums/characterGender.enum.js";
import type { CharacterStatus } from "../enums/characterStatus.enum.js";
import type { PaginationQuery } from "./pagination.interface.js";

export type CharacterSortOrder = "ASC" | "DESC";

export type CharacterSortField =
  | "externalId"
  | "name"
  | "status"
  | "species"
  | "gender"
  | "originName"
  | "locationName"
  | "type"
  | "episodeCount"
  | "lastSyncedAt"
  | "updatedAt";

export interface CharacterFilters {
  name?: string;
  status?: CharacterStatus;
  species?: string;
  gender?: CharacterGender;
  originName?: string;
  locationName?: string;
  type?: string;
  episodeCountMin?: number;
  episodeCountMax?: number;
}

export interface CharacterListQuery {
  pagination: PaginationQuery;
  filters: CharacterFilters;
  sortBy: CharacterSortField;
  sortOrder: CharacterSortOrder;
}

export interface CharacterAppliedFilters extends CharacterFilters {
  sortBy: CharacterSortField;
  sortOrder: CharacterSortOrder;
}

export interface CharacterListResponse {
  pagination: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
  appliedFilters: CharacterAppliedFilters;
}
