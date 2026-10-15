import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';
import { env } from '../config/env.js';

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
) {
  if (err instanceof AppError) {
    logger.warn(
      {
        path: req.path,
        method: req.method,
        statusCode: err.statusCode,
        code: err.code,
        message: err.message,
      },
      'Operational Error Handled'
    );

    return res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        details: err.details,
      },
    });
  }

  // Unhandled / Unexpected Server Error
  logger.error(
    {
      err,
      path: req.path,
      method: req.method,
      body: req.body,
    },
    'Unhandled Exception'
  );

  return res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Ocorreu um erro interno no servidor. Nossa equipe foi notificada.',
      details: env.NODE_ENV === 'development' ? err.message : undefined,
    },
  });
}
