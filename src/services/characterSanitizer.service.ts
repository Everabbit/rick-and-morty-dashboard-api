import type { RickAndMortyCharacter, SanitizedCharacter } from "../interfaces/rickAndMortyApi.interface.js";

const sanitizeText = (value: string | undefined): string => {
  if (!value) {
    return "";
  }

  return value.trim();
};

const sanitizeStatus = (status: string): number => {
  switch (status.toLowerCase()) {
    case "alive":
      return 1;
    case "dead":
      return 2;
    case "unknown":
      return 3;
    default:
      return 3;
  }
};

const sanitizeGender = (gender: string): number => {
  switch (gender.toLowerCase()) {
    case "female":
      return 1;
    case "male":
      return 2;
    case "genderless":
      return 3;
    case "unknown":
      return 4;
    default:
      return 4;
  }
};

export const sanitizeCharacter = (rawCharacter: RickAndMortyCharacter, syncedAt: Date): SanitizedCharacter => {
  return {
    externalId: rawCharacter.id,
    name: sanitizeText(rawCharacter.name),
    status: sanitizeStatus(rawCharacter.status),
    species: sanitizeText(rawCharacter.species),
    type: sanitizeText(rawCharacter.type),
    gender: sanitizeGender(rawCharacter.gender),
    originName: sanitizeText(rawCharacter.origin?.name),
    locationName: sanitizeText(rawCharacter.location?.name),
    image: sanitizeText(rawCharacter.image),
    episodeCount: rawCharacter.episode.length,
    lastSyncedAt: syncedAt,
  };
};

export const sanitizeCharacters = (rawCharacters: RickAndMortyCharacter[], syncedAt: Date): SanitizedCharacter[] => {
  return rawCharacters.map((character) => sanitizeCharacter(character, syncedAt));
};
