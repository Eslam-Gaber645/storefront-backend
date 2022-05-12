'use strict';

import { STATUS_CODES } from 'http';

export type StructuredErrorData = {
  [key: string]: StructuredErrorData | string | string[] | void;
};

/**
 * Custom http error class.
 * @export
 * @class HttpError
 * @extends {Error}
 */
export default class HttpError extends Error {
  productionMessage?: string;
  statusCode: number;
  data: StructuredErrorData;

  /**
   * Creates an instance of HttpError.
   * @param {number} statusCode
   * @param {string} [message]
   * @param {StructuredErrorData} [data={}]
   * @memberof HttpError
   */
  constructor(
    statusCode: number,
    message?: string,
    data: StructuredErrorData = {}
  ) {
    message =
      message || STATUS_CODES[statusCode] || STATUS_CODES[(statusCode = 500)];

    //!if NODE_ENV is "production", we'll set message in productionMessage property (for security reason).
    if (process.env.NODE_ENV !== 'production') super(message);
    else {
      super();
      this.productionMessage = message;
    }
    this.statusCode = statusCode;
    this.data = data;
  }
}
