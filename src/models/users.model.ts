'use strict';

import { getDb } from '../configuration';
import CoreModel from './CoreModel';

export type User = {
  id?: number;
  username: string;
  firstname: string;
  lastname: string;
  role?: 'admin' | 'user';
  password: string;
};

/**
 * singleton users model.
 * @export
 * @class UsersModel
 * @extends {UsersModel<User>}
 */
export class UsersModel extends CoreModel<User> {
  private static instance: UsersModel;
  /**
   * Creates or retrieve an instance of UsersModel.
   * @memberof UsersModel
   */
  constructor() {
    if (UsersModel.instance) {
      UsersModel.instance.db = getDb();
      return UsersModel.instance;
    }

    super('users');
    UsersModel.instance = this;
  }
}

export default new UsersModel();
