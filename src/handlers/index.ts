'use strict';

import { Application } from 'express';
import usersRoutes from './users.handlers';
import productsRoutes from './products.handlers';
import ordersRoutes from './orders.handlers';

/**
 * Setup all routes in "express" app.
 * @export
 * @param {Application} app
 * @return {Application} The express app after setup routes.
 */
export default function setupRoutes(app: Application): Application {
  usersRoutes(app);
  productsRoutes(app);
  ordersRoutes(app);

  return app;
}
