'use strict';

import { Application, NextFunction, Request, Response, Router } from 'express';
import { hashingPassword, HttpError } from '../helpers';
import { User, usersModel } from '../models';
import { AuthCredential, authenticate } from '../services';
import { checkAuth, validator } from '../middleware';
import { usersSchema } from './validations';

/**
 * User login handler.
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 */
async function login(req: Request, res: Response, next: NextFunction) {
  try {
    // Get user credential from request.
    const authCredential: AuthCredential = req.body,
      // Try to authenticate user.
      token = await authenticate(authCredential);

    if (!token) throw new HttpError(401, "Your Credential isn't valid");

    res.json({
      status: 'success',
      data: {
        token,
      },
    });
  } catch (e) {
    next(e);
  }
}

/**
 * Index users handler.
 * @param {Request} _req
 * @param {Response} res
 * @param {NextFunction} next
 */
async function index(_req: Request, res: Response, next: NextFunction) {
  try {
    // Get users from DB.
    const users = await usersModel.index({
      projection: ['id', 'username', 'firstname', 'lastname', 'role'],
    });

    res.json({
      status: 'success',
      data: [...users],
    });
  } catch (e) {
    next(e);
  }
}

/**
 * Show single user handler.
 * @param {Request} _req
 * @param {Response} res
 * @param {NextFunction} next
 */
async function show(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseInt(req.params.id);
    if (!id) throw new HttpError(404);
    // Get user from DB.
    const user = await usersModel.findOne({
      condition: { id },
      projection: ['id', 'username', 'firstname', 'lastname', 'role'],
    });

    if (!user) throw new HttpError(404);

    res.json({
      status: 'success',
      data: {
        ...user,
      },
    });
  } catch (e) {
    next(e);
  }
}

/**
 * Create user handler.
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 */
async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const user: User = req.body,
      passwordHash = await hashingPassword(user.password);
    user.password = passwordHash;
    const createResult = await usersModel.create(user);

    if (createResult.rowCount < 1) throw new HttpError(500);

    const data = createResult.rows[0];
    delete data.password;

    res.status(201).json({
      status: 'success',
      data,
    });
  } catch (e) {
    next(e);
  }
}

/**
 * Delete single user handler.
 * @param {Request} _req
 * @param {Response} res
 * @param {NextFunction} next
 */
async function delete_(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseInt(req.params.id);
    if (!id) throw new HttpError(404);
    // Check if id is same auth id.
    if (id === res.locals.auth.id)
      throw new HttpError(409, 'Conflict!, You try to delete your account');

    const deleteResult = await usersModel.delete({ id });

    // If no data deleted, serve response with status 404.
    if (deleteResult.rowCount < 1) throw new HttpError(404);

    const data = deleteResult.rows[0];
    delete data.password;

    res.json({
      status: 'success',
      data,
    });
  } catch (e) {
    next(e);
  }
}

/**
 * Setup users routes in app instance.
 * @export
 * @param {Application} app
 * @return {Application} Express application after setup users routes
 */
export default function usersRoutes(app: Application): Application {
  const router = Router();

  router
    // setup 'signup' route.
    .post(
      '/signup',
      validator({ schema: usersSchema, validateType: 'signup' }),
      create
    )
    // setup 'login' route.
    .post('/login', login)
    // setup 'index' route.
    .get('/', checkAuth(), index)
    // setup 'show' route.
    .get('/:id', checkAuth(), show)
    // setup 'create' route.
    .post(
      '/',
      checkAuth('admin'),
      validator({ schema: usersSchema, validateType: 'create' }),
      create
    )
    // setup 'delete' route.
    .delete('/:id', checkAuth('admin'), delete_);

  app.use('/users', router);

  return app;
}
