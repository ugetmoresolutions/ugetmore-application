import { HttpException } from '../exceptions/HttpException';
import { plainToInstance } from 'class-transformer';
import { validateOrReject, ValidationError } from 'class-validator';
import { NextFunction, Request, Response } from 'express';

export const ValidationMiddleware = (
  type: any,
  skipMissingProperties = false,
  whitelist = false,
  forbidNonWhitelisted = false
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const dto = plainToInstance(type, req.body);
      await validateOrReject(dto, { 
        skipMissingProperties, 
        whitelist, 
        forbidNonWhitelisted 
      });
      
      req.body = dto;
      next();
    } catch (errors) {
      if (Array.isArray(errors)) {
        const message = errors
          .flatMap((error: ValidationError) => 
            error.constraints ? Object.values(error.constraints) : []
          )
          .join(', ');
          
        next(new HttpException(400, message || 'Validation failed'));
      } else {
        next(new HttpException(400, 'Validation failed'));
      }
    }
  };
};