import { QueryResult } from 'pg';
import { User, usersModel } from '../../models';

describe('-Test users model:-', () => {
  const testUser: User = {
    username: 'testUser',
    firstname: 'test',
    lastname: 'test',
    role: 'user',
    password: '123456789',
  };
  let insertedTestUser: User;

  describe('--Method: usersModel.create(user):-', () => {
    it('--Should be create user in DB.', async () => {
      const promise = usersModel.create(testUser);
      await expectAsync(promise).toBeResolved();
      const result: QueryResult = await promise;
      expect(result.rowCount).toBe(1);
      expect(result.rows[0].id).toBeTruthy();
      insertedTestUser = result.rows[0];
    });

    it('--Should be rejected with an error if the data passed is invalid for the user schema', async () => {
      const promise = usersModel.create({
        username: 'Invalid user schema',
      } as User);
      await expectAsync(promise).toBeRejectedWithError(Error);
    });
  });

  describe('--Method: usersModel.findOne(selectOptions):-', () => {
    it('--Should be get user from DB.', async () => {
      const promise = usersModel.findOne({
        condition: { id: insertedTestUser.id },
      });
      await expectAsync(promise).toBeResolved();
      const user = await promise;
      expect(user).toEqual(insertedTestUser);
    });

    it('--Should be resolved to null if the requested user is not in the database.', async () => {
      const promise = usersModel.findOne({
        condition: { username: 'Invalid' },
      });
      await expectAsync(promise).toBeResolved();
      const user = await promise;
      expect(user).toEqual(null);
    });
  });

  describe('--Method: usersModel.index(selectOptions):-', () => {
    it('--Should be get users list from DB.', async () => {
      const promise = usersModel.index();
      await expectAsync(promise).toBeResolved();
      const users = await promise;
      expect(users).toEqual([insertedTestUser]);
    });
  });

  describe('--Method: usersModel.update({changes,conditions}):-', () => {
    const newUserName = 'updatedName';
    it('--Should be update user in DB.', async () => {
      const promise = usersModel.update({
        changes: { username: newUserName },
        condition: { id: insertedTestUser.id },
      });
      await expectAsync(promise).toBeResolved();
      const result: QueryResult = await promise;
      expect(result.rowCount).toBe(1);
      expect(result.rows[0].username).toEqual(newUserName);
    });
  });

  describe('--Method: usersModel.checkExistence(searchCondition):-', () => {
    it('--Should be resolved to true if user exists in DB.', async () => {
      const promise = usersModel.checkExistence({
        id: insertedTestUser.id,
      });
      await expectAsync(promise).toBeResolved();
      const result: Boolean = await promise;
      expect(result).toBeTrue();
    });
    it("--Should be resolved to false if user isn't exists in DB.", async () => {
      const promise = usersModel.checkExistence({
        username: 'Invalid',
      });
      await expectAsync(promise).toBeResolved();
      const result: Boolean = await promise;
      expect(result).toBeFalse();
    });
  });

  describe('--Method: usersModel.delete(conditions):-', () => {
    it('--Should be delete user from DB.', async () => {
      const promise = usersModel.delete({ id: insertedTestUser.id });
      await expectAsync(promise).toBeResolved();
      const result: QueryResult = await promise;
      expect(result.rowCount).toBe(1);
    });
  });
});
