'use strict';

import { Pool, PoolConfig } from 'pg';

export default class DBPool extends Pool {
  private static instance?: DBPool;

  constructor(config?: PoolConfig) {
    if (DBPool.instance) return DBPool.instance;
    const { NODE_ENV, PGDATABASE_PROD, PGDATABASE_DEV, PGDATABASE_TEST } =
        process.env,
      database =
        NODE_ENV === 'production'
          ? PGDATABASE_PROD
          : NODE_ENV === 'development'
          ? PGDATABASE_DEV
          : PGDATABASE_TEST;

    super({ database, ...config });
    DBPool.instance = this;
  }

  renew(config?: PoolConfig): DBPool {
    return DBPool.renew(config);
  }

  static renew(config?: PoolConfig): DBPool {
    delete DBPool.instance;
    return new this(config);
  }
}
