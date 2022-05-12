import Joi, { Schema } from 'joi';

// Define products data schema,
// to validate products endpoints data using it.

const optionalOnUpdate = {
    update: (schema: Schema) => schema.optional(),
  },
  productSchema = Joi.object({
    product_name: Joi.string()
      .min(3)
      .max(100)
      .alphanum()
      .required()
      .alter(optionalOnUpdate),
    price: Joi.number().min(1).required().alter(optionalOnUpdate),
  }).alter({ update: schema => schema.min(1) });

export default productSchema;
