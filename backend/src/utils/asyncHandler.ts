import { Handler, NextFunction, Request, Response } from 'express';

export const asyncHandler = (handler: Handler) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(handler(req, res, next)).catch((err) => next(err));
};
