'use strict';

import { NextFunction, Request, Response } from 'express';
import { STATUS_CODES } from 'http';
import { HttpError } from '../helpers';

type ExtendedError = HttpError & { [Key: string]: number | string };

export default function globalErrorsHandler(
  err: ExtendedError,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  // apply errors interceptor in error for any customization.
  err = errorsInterceptor(err) as ExtendedError;

  // get status code from err object Or set it as 500 if not exists.
  const statusCode = err.statusCode || 500,
    // get status type based (error or fail).
    status = statusCode > 499 ? 'error' : 'fail',
    message =
      err[
        process.env.NODE_ENV !== 'production' ? 'message' : 'productionMessage'
        // get the (error | fail) message base on NODE_ENV (for security reason),
        // and set message based on status code if it's not exists.
      ] || STATUS_CODES[statusCode];

  // get the (error | fail) data and set message value
  // to message property in it if "status type" = error.
  if (status === 'fail')
    if (err.data && typeof err.data === 'object') err.data._message = message;
    else err.data = { _message: message };

  const data = err.data,
    // create final response body based on above values.
    JSend =
      status === 'error'
        ? {
            status,
            message,
            data,
          }
        : {
            status,
            data,
          };

  // send response with http error.
  res.status(statusCode).json(JSend);

  if (process.env.NODE_ENV === 'development') console.error(err);
}

function errorsInterceptor(err: ExtendedError) {
  if (err.code === '23505' && 'constraint' in err)
    return new HttpError(409, 'Invalid endpoint data', {
      [(err.detail as string).match(/\((\w+)\)/)?.[1] as string]:
        'already exists',
    });
  if (err.code === '23503' && 'constraint' in err)
    return new HttpError(409, 'Invalid endpoint data', {
      [(err.detail as string).match(/\((\w+)\)/)?.[1] as string]:
        err.detail as string,
    });

  return err;
}
