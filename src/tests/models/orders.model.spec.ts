import { QueryResult } from 'pg';
import {
  Order,
  FullOrderLookup,
  ordersModel,
  User,
  usersModel,
} from '../../models';

describe('-Test orders model:-', () => {
  const testUser: User = {
      username: 'testUser',
      firstname: 'test',
      lastname: 'test',
      role: 'user',
      password: '123456789',
    },
    testOrder: Order = {
      status: 'active',
      user_id: 0,
    };
  let insertedTestOrder: Order;

  beforeAll(async () => {
    const createdUser: QueryResult = await usersModel.create(testUser);

    if (createdUser.rowCount < 1)
      throw new Error('Failed to create test user account');

    testOrder.user_id = testUser.id = createdUser.rows[0].id;
  });

  afterAll(async () => {
    await usersModel.delete({ id: testUser.id });
  });

  describe('--Method: ordersModel.create(order):-', () => {
    it('--Should be create order in DB.', async () => {
      const promise = ordersModel.create(testOrder);
      await expectAsync(promise).toBeResolved();
      const result: QueryResult = await promise;
      expect(result.rowCount).toBe(1);
      expect(result.rows[0].id).toBeTruthy();
      insertedTestOrder = result.rows[0];
    });

    it('--Should be rejected with an error if the data passed is invalid for the order schema', async () => {
      const promise = ordersModel.create({
        status: 'Invalid' as Order['status'],
      } as Order);
      await expectAsync(promise).toBeRejectedWithError(Error);
    });
  });

  describe('--Method: ordersModel.findOne(selectOptions):-', () => {
    it('--Should be get order from DB.', async () => {
      const promise = ordersModel.findOne({
        condition: { id: insertedTestOrder.id },
      });
      await expectAsync(promise).toBeResolved();
      const order = await promise;
      expect(order).toEqual(insertedTestOrder);
    });

    it('--Should be resolved to null if the requested order is not in the database.', async () => {
      const promise = ordersModel.findOne({
        condition: { id: 555 },
      });
      await expectAsync(promise).toBeResolved();
      const order = await promise;
      expect(order).toEqual(null);
    });
  });

  describe('--Method: ordersModel.findOneByLookup(selectOptions):-', () => {
    let promise: Promise<FullOrderLookup | null>;
    beforeAll(async () => {
      promise = ordersModel.findOneByLookup({
        condition: { id: insertedTestOrder.id },
      });
    });

    it('--Should be get order from DB with lookup products related to this order.', async () => {
      await expectAsync(promise).toBeResolved();
      const order = await promise;
      expect(order?.order_products).toEqual([]);
    });

    it('--Should be get order from DB with lookup username related to this order.', async () => {
      await expectAsync(promise).toBeResolved();
      const order = await promise;
      expect(order?.username).toEqual(testUser.username);
    });
  });

  describe('--Method: ordersModel.index(selectOptions):-', () => {
    it('--Should be get orders list from DB.', async () => {
      const promise = ordersModel.index();
      await expectAsync(promise).toBeResolved();
      const orders = await promise;
      expect(orders).toEqual([insertedTestOrder]);
    });
  });

  describe('--Method: ordersModel.update({changes,conditions}):-', () => {
    const newStatus: Order['status'] = 'complete';
    it('--Should be update order in DB.', async () => {
      const promise = ordersModel.update({
        changes: { status: newStatus },
        condition: { id: insertedTestOrder.id },
      });
      await expectAsync(promise).toBeResolved();
      const result: QueryResult = await promise;
      expect(result.rowCount).toBe(1);
      expect(result.rows[0].status).toEqual(newStatus);
    });
  });

  describe('--Method: ordersModel.checkExistence(searchCondition):-', () => {
    it('--Should be resolved to true if order exists in DB.', async () => {
      const promise = ordersModel.checkExistence({
        id: insertedTestOrder.id,
      });
      await expectAsync(promise).toBeResolved();
      const result: boolean = await promise;
      expect(result).toBeTrue();
    });
    it("--Should be resolved to false if order isn't exists in DB.", async () => {
      const promise = ordersModel.checkExistence({
        id: 55,
      });
      await expectAsync(promise).toBeResolved();
      const result: boolean = await promise;
      expect(result).toBeFalse();
    });
  });

  describe('--Method: ordersModel.delete(conditions):-', () => {
    it('--Should be delete order from DB.', async () => {
      const promise = ordersModel.delete({ id: insertedTestOrder.id });
      await expectAsync(promise).toBeResolved();
      const result: QueryResult = await promise;
      expect(result.rowCount).toBe(1);
    });
  });
});
