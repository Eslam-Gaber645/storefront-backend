'use strict';

import { randomBytes, pbkdf2 } from 'crypto';

/**
 * Create password hash with salt and pepper.
 * @export
 * @param {string} password
 * @return {Promise<string>}
 */
export async function hashingPassword(password: string): Promise<string> {
  // create random 5 bytes as pepper.
  const pepper = randomBytes(5).toString('hex'),
    {
      PWH_SALT: salt,
      PWH_ITERATIONS: iterationCount,
      PWH_ALGORITHM: algorithm,
    } = process.env,
    // promisify the async pbkdf2 to await it.
    hash = await new Promise((resolve, reject) => {
      // create password hash.
      pbkdf2(
        pepper + password,
        salt as string,
        parseInt(iterationCount as string),
        32,
        algorithm as string,
        (err, key) => {
          // then resolve promise with result.
          if (err) return reject(err);
          resolve(key.toString('hex'));
        }
      );
    });

  // return password hash with pepper in first 5 bytes.
  return `${pepper}${hash}`;
}

/**
 * Confirm untrusted password by original password hash.
 * @export
 * @param {string} password
 * @param {string} hash
 * @return {Promise<boolean>}
 */
export async function confirmPassword(
  password: string,
  hash: string
): Promise<boolean> {
  // extract pepper form original password hash,
  const pepper = hash.slice(0, 10),
    // extract original password hash without pepper.
    originalHash = hash.slice(10),
    {
      PWH_SALT: salt,
      PWH_ITERATIONS: iterationCount,
      PWH_ALGORITHM: algorithm,
    } = process.env,
    // promisify the async pbkdf2 to await it.
    untrustedHash = await new Promise((resolve, reject) => {
      // sign password with with same original hash signature options.
      pbkdf2(
        pepper + password,
        salt as string,
        parseInt(iterationCount as string),
        32,
        algorithm as string,
        (err, key) => {
          // resolve promise with result.
          if (err) return reject(err);
          resolve(key.toString('hex'));
        }
      );
    });

  // return the confirmation result.
  return originalHash === untrustedHash;
}
