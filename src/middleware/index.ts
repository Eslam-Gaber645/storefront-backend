'use strict';

import bodyParser from 'body-parser';
import { Application } from 'express';
import { authorization, checkAuth } from './authorization';
import globalErrorsHandler from './globalErrorsHandler';
import validator from './validator';

export { validator, checkAuth };
export default function setupMiddleware(app: Application): Application {
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(authorization);

  process.nextTick(() => {
    app.use(globalErrorsHandler);
  });

  return app;
}
