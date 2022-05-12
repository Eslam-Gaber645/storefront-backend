'use strict';

import Joi, { Schema } from 'joi';

// Define orders data schema,
// to validate orders endpoints data using it.

const optionalOnUpdate = {
    update: (schema: Schema) => schema.optional(),
  },
  orderProductsSchema: Schema = Joi.object({
    product_id: Joi.number().required().alter(optionalOnUpdate),
    quantity: Joi.number().required().alter(optionalOnUpdate),
  }).alter({ update: schema => schema.min(1) });

export default orderProductsSchema;
