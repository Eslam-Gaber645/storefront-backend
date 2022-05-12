'use strict';

import { Application, NextFunction, Request, Response, Router } from 'express';
import { HttpError } from '../helpers';
import {
  Order,
  ordersModel,
  OrderProduct,
  orderProductsModel,
} from '../models';
import { checkAuth, validator } from '../middleware';
import { orderProductsSchema } from './validations';
import { SqlCondition } from '../models/CoreModel';

/**
 * Index orders handler.
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 */
async function index(req: Request, res: Response, next: NextFunction) {
  try {
    const status = req.query.status,
      user_id = Number(req.query.user_id),
      indexCondition: SqlCondition<Order> = {
        status:
          status === 'complete' || status === 'active' ? status : 'complete',
      };

    if (user_id && res.locals.auth.role === 'admin')
      indexCondition.user_id = user_id;
    else indexCondition.user_id = res.locals.auth.id;

    const orders: Order[] = await ordersModel.indexByLookup({
      condition: indexCondition,
    });

    res.json({
      status: 'success',
      data: orders,
    });
  } catch (e) {
    next(e);
  }
}

/**
 * Show single order handler.
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 */
async function show(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id);
    // Check if id is valid number.
    if (!id) throw new HttpError(404);

    const findCondition: SqlCondition<Order> = { id };

    if (res.locals.auth.role !== 'admin')
      findCondition.user_id = res.locals.auth.id;

    const order = await ordersModel.findOneByLookup({
      condition: findCondition,
    });

    if (!order) throw new HttpError(404);

    res.json({
      status: 'success',
      data: {
        ...order,
      },
    });
  } catch (e) {
    next(e);
  }
}

/**
 * Show single order handler.
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 */
async function showActive(req: Request, res: Response, next: NextFunction) {
  try {
    const findCondition: SqlCondition<Order> = { status: 'active' },
      user_id = Number(req.query.user_id);

    if (user_id && res.locals.auth.role === 'admin')
      findCondition.user_id = user_id;
    else findCondition.user_id = res.locals.auth.id;

    const order = await ordersModel.findOneByLookup({
      condition: findCondition,
    });

    if (!order) throw new HttpError(404);

    res.json({
      status: 'success',
      data: {
        ...order,
      },
    });
  } catch (e) {
    next(e);
  }
}

/**
 * Create single order handler.
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 */
async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const order: Partial<Order> = { status: 'active' };

    if (res.locals.auth.role === 'admin' && req.body.user_id) {
      order.user_id = Number(req.body.user_id);

      // user id validation.
      if (!order.user_id)
        throw new HttpError(400, 'Invalid endpoint data', {
          user_id: 'must be a number',
        });
    } else {
      const user_id = res.locals.auth.id;
      order.user_id = user_id;
    }

    const existsActiveOrder = await ordersModel.checkExistence(order);

    // If user have exists active order, serve response with status 409.
    if (existsActiveOrder)
      throw new HttpError(409, 'Conflict!, Active order already exists.');

    const createResult = await ordersModel.create(<Order>order);

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
 * Create order complete handler.
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 */
async function complete(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id);
    // Check if id is valid number.
    if (!id) throw new HttpError(404);

    const condition: SqlCondition<Order> = { id, status: 'active' };

    if (res.locals.auth.role !== 'admin')
      condition.user_id = res.locals.auth.id;

    const updateResult = await ordersModel.update({
      changes: { status: 'complete' },
      condition,
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
 * Delete single order handler.
 * @param {Request} _req
 * @param {Response} res
 * @param {NextFunction} next
 */
async function delete_(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id);

    // Check if id is valid number.
    if (!id) throw new HttpError(404);

    const condition: SqlCondition<Order> = { id };

    if (res.locals.auth.role !== 'admin')
      condition.user_id = res.locals.auth.id;

    const deleteResult = await ordersModel.delete(condition);

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
 * Add single product to order handler.
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 */
async function addProduct(req: Request, res: Response, next: NextFunction) {
  try {
    const order_id = Number(req.params.id);
    // Check if order id is valid number.
    if (!order_id) throw new HttpError(404);

    const orderProduct: OrderProduct = Object.assign(req.body, { order_id }),
      checkActiveOrderCondition: SqlCondition<Order> = {
        id: order_id,
        status: 'active',
      };

    if (res.locals.auth.role !== 'admin')
      checkActiveOrderCondition.user_id = res.locals.auth.id;

    const existsActiveOrder = await ordersModel.checkExistence(
      checkActiveOrderCondition
    );

    // If no active order exists, serve response with status 409.
    if (!existsActiveOrder)
      throw new HttpError(404, 'Not found order or order has ben completed.');

    const createResult = await orderProductsModel.create(orderProduct);

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
 * Delete single product from order handler.
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 */
async function deleteProduct(req: Request, res: Response, next: NextFunction) {
  try {
    const order_id = Number(req.params.id),
      order_product_id = Number(req.params.order_product_id);
    // Check if ids is valid number.
    if (!order_id || !order_product_id) throw new HttpError(404);

    const checkActiveOrderCondition: SqlCondition<Order> = {
      id: order_id,
      status: 'active',
    };

    if (res.locals.auth.role !== 'admin')
      checkActiveOrderCondition.user_id = res.locals.auth.id;

    const existsActiveOrder = await ordersModel.checkExistence(
      checkActiveOrderCondition
    );

    // If active order is not exists, serve response with status 409.
    if (!existsActiveOrder)
      throw new HttpError(404, 'Not found order or order has ben completed.');

    const deleteResult = await orderProductsModel.delete({
      id: order_product_id,
      order_id,
    });

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
 * Setup orders routes in app instance.
 * @export
 * @param {Application} app
 * @return {Application} Express application after setup orders routes
 */
export default function ordersRoutes(app: Application): Application {
  const router = Router();

  router
    // setup 'index' route.
    .get('/', checkAuth(), index)
    // setup 'show' route.
    .get('/active', checkAuth(), showActive)
    // setup 'show' route.
    .get('/:id', checkAuth(), show)
    // setup 'create' route.
    .post('/', checkAuth(), create)
    // setup 'complete' route.
    .put('/:id/complete', checkAuth(), complete)
    // setup 'delete' route.
    .delete('/:id', checkAuth(), delete_)
    // setup 'add product to order' route.
    .post(
      '/:id/products/',
      checkAuth(),
      validator({ schema: orderProductsSchema }),
      addProduct
    )
    // setup 'delete product from order' route.
    .delete('/:id/products/:order_product_id', checkAuth(), deleteProduct);

  app.use('/orders', router);

  return app;
}
