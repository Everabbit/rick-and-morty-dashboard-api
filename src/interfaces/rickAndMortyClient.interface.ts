import type {
  RickAndMortyCharacter,
  RickAndMortyCharacterPageResponse,
} from "./rickAndMortyApi.interface.js";

export interface CharacterPageFetchResult {
  page: number;
  retries: number;
  data: RickAndMortyCharacterPageResponse;
}

export interface FetchCharactersResult {
  characters: RickAndMortyCharacter[];
  pagesFetched: number;
  retryCount: number;
}
