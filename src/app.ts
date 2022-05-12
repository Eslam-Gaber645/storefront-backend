'use strict';

import { initEnvVariables } from './configuration';

initEnvVariables();

import express, { Application } from 'express';
import setupMiddleware from './middleware';
import setupRoutes from './handlers';

const app: Application = express();
const port: number = parseInt(process.env.APP_PORT as string) || 3000;

setupRoutes(setupMiddleware(app)).listen(port, function () {
  console.info(`Starting app on port: ${port}!`);
});

export default app;
