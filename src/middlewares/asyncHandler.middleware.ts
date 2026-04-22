import type { NextFunction, Request, RequestHandler, Response } from "express";

export const asyncHandlerMiddleware = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>,
): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction) => {
    void fn(req, res, next).catch(next);
  };
};
