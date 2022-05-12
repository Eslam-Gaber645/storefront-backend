'use strict';

import { Application, NextFunction, Request, Response, Router } from 'express';
import { HttpError } from '../helpers';
import { Product, productsModel } from '../models';
import { validator, checkAuth } from '../middleware';
import { productsSchema } from './validations';

/**
 * Index products handler.
 * @param {Request} _req
 * @param {Response} res
 * @param {NextFunction} next
 */
async function index(_req: Request, res: Response, next: NextFunction) {
  try {
    // Get products from DB.
    const products: Product[] = await productsModel.index();

    res.json({
      status: 'success',
      data: products,
    });
  } catch (e) {
    next(e);
  }
}

/**
 * Show single product handler.
 * @param {Request} _req
 * @param {Response} res
 * @param {NextFunction} next
 */
async function show(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseInt(req.params.id);
    if (!id) throw new HttpError(404);

    const product = await productsModel.findOne({
      condition: { id },
    });

    if (!product) throw new HttpError(404);

    res.json({
      status: 'success',
      data: {
        ...product,
      },
    });
  } catch (e) {
    next(e);
  }
}

/**
 * Create single product handler.
 * @param {Request} _req
 * @param {Response} res
 * @param {NextFunction} next
 */
async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const product: Product = req.body,
      createResult = await productsModel.create(product);

    if (createResult.rowCount < 1) throw new HttpError(500);

    res.status(201).json({
      status: 'success',
      data: createResult.rows[0],
    });
  } catch (e) {
    next(e);
  }
}

/**
 * Update single product handler.
 * @param {Request} _req
 * @param {Response} res
 * @param {NextFunction} next
 */
async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseInt(req.params.id);
    if (!id) throw new HttpError(404);

    const product: Partial<Product> = req.body,
      updateResult = await productsModel.update({
        changes: product,
        condition: { id },
      });

    if (updateResult.rowCount < 1) throw new HttpError(404);

    res.json({
      status: 'success',
      data: updateResult.rows[0],
    });
  } catch (e) {
    next(e);
  }
}

/**
 * Delete single product handler.
 * @param {Request} _req
 * @param {Response} res
 * @param {NextFunction} next
 */
async function delete_(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseInt(req.params.id);
    if (!id) throw new HttpError(404);

    const deleteResult = await productsModel.delete({ id });
    if (deleteResult.rowCount < 1) throw new HttpError(404);

    res.json({
      status: 'success',
      data: deleteResult.rows[0],
    });
  } catch (e) {
    next(e);
  }
}

/**
 * Setup products routes in app instance.
 * @export
 * @param {Application} app
 * @return {Application} Express application after setup products routes
 */
export default function productsRoutes(app: Application): Application {
  const router = Router();

  router
    // setup 'index' route.
    .get('/', index)
    // setup 'show' route.
    .get('/:id', show)
    // setup 'create' route.
    .post(
      '/',
      checkAuth('admin'),
      validator({ schema: productsSchema }),
      create
    )
    // setup 'update' route.
    .put(
      '/:id',
      checkAuth('admin'),
      validator({
        schema: productsSchema,
        validateType: 'update',
      }),
      update
    )
    // setup 'delete' route.
    .delete('/:id', checkAuth('admin'), delete_);

  app.use('/products', router);

  return app;
}
