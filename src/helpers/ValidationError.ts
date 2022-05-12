'use strict';

import HttpError, { StructuredErrorData } from './HttpError';

/**
 * Custom validation error class.
 * @export
 * @class HttpError
 * @extends {Error}
 */
export default class ValidationError extends Error {
  validationResult: StructuredErrorData;

  /**
   * Creates an instance of ValidationError.
   * @param {string} [message]
   * @param {StructuredErrorData} [validationResult={}]
   * @memberof ValidationError
   */
  constructor(message?: string, validationResult: StructuredErrorData = {}) {
    super(message);

    this.validationResult = validationResult;
  }

  /**
   * Transform error to HttpError.
   * @param {number} statusCode
   * @param {string} customMessage
   * @return {HttpError}
   * @memberof ValidationError
   */
  getHttpError(statusCode: number, customMessage?: string): HttpError {
    return new HttpError(
      statusCode,
      customMessage || this.message,
      this.validationResult
    );
  }
}
