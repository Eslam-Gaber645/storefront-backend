'use strict';

import {
  ValidationError as JoiValidationErrorItem,
  Schema,
  ValidationOptions,
} from 'joi';
import escapeRegEx from './escapeRegEx';
import { StructuredErrorData } from './HttpError';
import ValidationError from './ValidationError';

/**
 * Validate and sanitize data based on joi schemas,
 * and normalize validations errors to make it compatible with JSend style.
 * @export
 * @template DataType
 * @param {Schema} schema
 * @param {DataType} data
 * @param {ValidationOptions} [options={}]
 * @return {Promise<DataType>}
 */
export default async function joiValidator<DataType>(
  schema: Schema,
  data: DataType,
  options: ValidationOptions = {}
): Promise<DataType> {
  options.skipFunctions = true;
  options.abortEarly ??= false;

  try {
    // Validate and sanitize data.
    const validation: DataType = await schema.validateAsync(data, options);
    return validation;
  } catch (e) {
    const error = <JoiValidationErrorItem>e;
    // normalize errors to make it like := { fieldKey1:"Error message", fieldKey2:"Error message2", ...}.
    const dataErrors: StructuredErrorData = {};

    error.details.forEach(errorDetail => {
      const fields = errorDetail.path;

      if (fields.length == 0) {
        // get message and normalize it.
        const errorMessage = errorDetail.message.replace(
          new RegExp('"value" failed custom validation because |"value" '),
          ''
        );

        Array.isArray(dataErrors['__data'])
          ? dataErrors['__data'].push(errorMessage)
          : (dataErrors['__data'] = [errorMessage]);
      } else {
        const label = escapeRegEx(errorDetail.context?.label as string),
          // get message and normalize it.
          errorMessage = errorDetail.message.replace(
            new RegExp(
              `"(${label}") failed custom validation because |"(${label})" `
            ),
            ''
          );

        fields.reduce((dataErrors, fieldName, index) => {
          return (dataErrors[fieldName] =
            index >= fields.length - 1
              ? errorMessage
              : { ...((dataErrors[fieldName] as object) || {}) });
        }, dataErrors);
      }
    });

    throw new ValidationError('Not valid data', dataErrors);
  }
}
