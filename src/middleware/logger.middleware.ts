import { Request, Response, NextFunction } from 'express';
import logger from '@services/logger.service';

interface RequestWithStartTime extends Request {
  startTime?: number;
}

export const requestLogger = (req: RequestWithStartTime, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  req.startTime = startTime;

  // Log incoming request
  console.log(`Incoming request: ${req.method} ${req.originalUrl}`);
  logger.info(`${req.method} ${req.originalUrl}`);

  // Override res.end to log response
  const originalEnd = res.end;
  res.end = function(chunk?: any, encoding?: any) {
    const responseTime = Date.now() - startTime;
    
    // Log the response
    console.log(`Response: ${req.method} ${req.originalUrl} ${res.statusCode} ${responseTime}ms`);
    logger.logRequest(
      req.method,
      req.originalUrl,
      res.statusCode,
      responseTime
    );

    // Call original end method and return its result
    return originalEnd.call(this, chunk, encoding);
  };

  next();
};


export default requestLogger;