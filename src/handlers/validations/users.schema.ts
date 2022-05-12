import Joi, { Schema } from 'joi';

// Define users data schema,
// to validate users endpoints data using it.

const stripOnLogin = {
    login: (schema: Schema) => schema.optional().strip(),
  },
  stripOnSignup = {
    signup: (schema: Schema) => schema.optional().strip(),
  },
  userSchema = Joi.object({
    username: Joi.string().min(3).max(100).alphanum().required(),
    firstname: Joi.string().min(3).max(50).required().alter(stripOnLogin),
    lastname: Joi.string().min(3).max(50).required().alter(stripOnLogin),
    role: Joi.string()
      .valid('admin', 'user')
      .alter(stripOnSignup)
      .alter(stripOnLogin),

    password: Joi.string().min(8).max(50).required(),
  });

export default userSchema;
