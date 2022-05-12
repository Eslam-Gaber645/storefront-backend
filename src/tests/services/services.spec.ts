import { QueryResult } from 'pg';
import { authenticate, authorize } from '../../services';
import { User, usersModel } from '../../models';
import { hashingPassword } from '../../helpers';

describe('-Test auth services:-', () => {
  const testUser: User = {
    username: 'testUser',
    firstname: 'test',
    lastname: 'test',
    role: 'user',
    password: '123456789',
  };
  let token: string;

  beforeAll(async () => {
    const passwordHash = await hashingPassword(testUser.password),
      createUser: QueryResult = await usersModel.create({
        ...testUser,
        password: passwordHash,
      });

    if (createUser.rowCount < 1)
      throw new Error('Failed to create test user account');
  });

  afterAll(async () => {
    await usersModel.delete({ id: testUser.id });
  });

  describe('--Function: authenticate({username,password}):-', () => {
    it('--Should be return jwt token if user credential is correct.', async () => {
      const promise = authenticate({
        username: testUser.username,
        password: testUser.password,
      });
      await expectAsync(promise).toBeResolved();
      token = (await promise) as string;
      expect(typeof token === 'string').toBeTruthy();
    });

    it('--Should be return null if username is incorrect.', async () => {
      const promise = authenticate({
        username: testUser.username + 'Invalid',
        password: testUser.password,
      });
      await expectAsync(promise).toBeResolved();
      const result = (await promise) as string;
      expect(result).toBeNull();
    });

    it('--Should be return null if password is incorrect.', async () => {
      const promise = authenticate({
        username: testUser.username,
        password: testUser.password + 'Invalid',
      });
      await expectAsync(promise).toBeResolved();
      const result = (await promise) as string;
      expect(result).toBeNull();
    });
  });

  describe('--Function: authorize(token):-', () => {
    it('--The authorized user data must be returned if the token is valid.', async () => {
      const promise = authorize(token);
      await expectAsync(promise).toBeResolved();
      const result = await promise;
      expect(['id', 'role'].every(e => e in (result as User))).toBeTruthy();
    });

    it('--Should be return null if the token is invalid.', async () => {
      const promise = authorize('invalid token');
      await expectAsync(promise).toBeResolved();
      const result = await promise;
      expect(result).toBeNull();
    });
  });
});
