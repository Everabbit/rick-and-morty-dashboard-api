import type { CharacterGender } from "../enums/characterGender.enum.js";
import type { CharacterStatus } from "../enums/characterStatus.enum.js";

export interface RickAndMortyOrigin {
  name: string;
  url: string;
}

export interface RickAndMortyLocation {
  name: string;
  url: string;
}

export interface RickAndMortyCharacter {
  id: number;
  name: string;
  status: string;
  species: string;
  type: string;
  gender: string;
  origin: RickAndMortyOrigin;
  location: RickAndMortyLocation;
  image: string;
  episode: string[];
  url: string;
  created: string;
}

export interface RickAndMortyInfo {
  count: number;
  pages: number;
  next: string | null;
  prev: string | null;
}

export interface RickAndMortyCharacterPageResponse {
  info: RickAndMortyInfo;
  results: RickAndMortyCharacter[];
}

export interface SanitizedCharacter {
  externalId: number;
  name: string;
  status: CharacterStatus;
  species: string;
  type: string;
  gender: CharacterGender;
  originName: string;
  locationName: string;
  image: string;
  episodeCount: number;
  lastSyncedAt: Date;
}
