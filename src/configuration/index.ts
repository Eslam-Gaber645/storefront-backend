'use strict';

import initEnvVariables from './env_vars';
import DBPool from './DBPool';

export { initEnvVariables, DBPool };

export function getDb() {
  return new DBPool();
}
