import { NextFunction, Request, RequestHandler, Response } from 'express';
import { Schema } from 'joi';
import { joiValidator, ValidationError } from '../helpers';

export type ValidatorOptions = {
  schema: Schema;
  key?: 'body' | 'query' | 'params';
  validateType?: string;
};
export default function validator({
  schema,
  key = 'body',
  validateType,
}: ValidatorOptions): RequestHandler {
  return async function validatorMiddleware(
    req: Request,
    _res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      req[key] = await joiValidator(
        schema.tailor(validateType || ''),
        req[key]
      );
      next();
    } catch (e) {
      const error = <ValidationError>e;
      next(error.getHttpError(400, 'Invalid endpoint data'));
    }
  };
}
