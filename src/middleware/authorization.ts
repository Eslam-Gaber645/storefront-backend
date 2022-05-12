'use strict';

import { NextFunction, Request, Response, RequestHandler } from 'express';
import { HttpError } from '../helpers';
import { authorize } from '../services';

export async function authorization(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    // get Authorization header value.
    const authorizationHeader = req.get('Authorization');

    // if Authorization header not have value,
    // then ignore the authorize process.
    if (authorizationHeader) {
      // extract auth token.
      const token = authorizationHeader.replace('Bearer ', ''),
        // try to authorize request by this token,
        // using "authorize" service.
        authorization = await authorize(token);

      res.locals.auth = authorization;

      return next();
    }

    // request not authorized,
    // then set "req.auth" as false,
    res.locals.auth = false;

    next();
  } catch (error) {
    next(error);
  }
}

export function checkAuth(role: 'user' | 'admin' = 'user'): RequestHandler {
  return function checkAuthMiddleware(
    _req: Request,
    res: Response,
    next: NextFunction
  ): void {
    if (res.locals.auth === null)
      throw new HttpError(401, 'Authorization failure.');
    else if (!res.locals.auth)
      return next(new HttpError(401, 'Login required.'));
    else if (role === 'admin' && res.locals.auth.role !== 'admin')
      return next(new HttpError(403, 'Not allowed endpoint for your account.'));

    next();
  };
}
