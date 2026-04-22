import type { Request, Response } from "express";
import type { CharacterListQuery } from "../interfaces/characterFilters.interface.js";
import { listCharactersQuery } from "../services/characterQuery.service.js";

export const listCharactersController = async (req: Request, res: Response): Promise<void> => {
  const query = res.locals.characterListQuery as CharacterListQuery;
  const result = await listCharactersQuery(query);

  res.status(200).json({
    pagination: result.pagination,
    appliedFilters: result.appliedFilters,
    data: result.data,
  });
};
