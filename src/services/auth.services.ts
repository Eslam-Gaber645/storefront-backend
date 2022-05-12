'use strict';

import jsonwebtoken from 'jsonwebtoken';
import { confirmPassword } from '../helpers';
import { User, usersModel } from '../models';

export async function authenticate({
  username,
  password,
}: AuthCredential): Promise<string | null> {
  // get original user credential using UsersModel.
  const user = await usersModel.findOne({ condition: { username } });

  // if user not exists return false.
  if (!user) return null;

  // check if the passed password is correct,
  // using (password.signatureConfirmation) helper.
  const isAuthenticated = await confirmPassword(password, user.password);

  // if password is not correct return false.
  if (!isAuthenticated) return null;

  // get user id from original user credential.
  const userID = user.id as number,
    // create token payload with user id.
    tokenPayload: JWTTokenPayload = {
      data: {
        userID,
      },
    },
    // promisify the async (jsonwebtoken) function to await it.
    JWTtoken = await new Promise((resolve, reject) => {
      // create token using (JWT) lib,
      // with the defined (JWT secret key).
      jsonwebtoken.sign(
        tokenPayload,
        process.env.JWT_KEY as string,
        {},
        (err, token) => {
          // resolve the promise with result.
          if (err) return reject(err);
          resolve(token);
        }
      );
    });

  return JWTtoken as string;
}

export async function authorize(token: string): Promise<User | null> {
  try {
    // promisify the async (jsonwebtoken) function to await it.
    const tokenPayload: JWTTokenPayload = await new Promise(
        (resolve, reject) => {
          // try to authorize user,
          // with the defined (JWT secret key).
          jsonwebtoken.verify(
            token,
            process.env.JWT_KEY as string,
            (err, payload) => {
              if (err) return reject(err);
              resolve(payload as JWTTokenPayload);
            }
          );
        }
      ),
      // if user authorized,
      // then take the user id from token payload,
      // and try to get authorized user data using UsersModel.
      authorizationData = await usersModel.findOne({
        condition: {
          id: tokenPayload.data.userID,
        },
      });

    // return authorized user data,
    // or reject the authorization if user not exists.
    return authorizationData;
  } catch (e) {
    // if token verify is failed,
    // then reject the authorization.
    return null;
  }
}

export type AuthCredential = {
  username: string;
  password: string;
};

export type JWTTokenPayload = {
  data: {
    userID: number;
  };
};
