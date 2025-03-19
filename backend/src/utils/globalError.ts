import { NextFunction, Request, Response } from 'express';
import ApiError from './apiError';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function globalErrCatch(err: ApiError, req: Request, res: Response, next: NextFunction): void {
  if (err instanceof ApiError) {
    
    res.status(err?.statusCode || 500).json({
      statuscode: err.statusCode || 500,
      message: err.message || undefined,
      error: err.error || undefined,
      stack: err.stack || undefined,
    });
  } else {
    res.status(500).json({
      statusCode: 500,
      error: err,
      globalMsg: "global error catch",
    });
  }
}
