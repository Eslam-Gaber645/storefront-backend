import { QueryResult } from 'pg';
import {
  Order,
  OrderProduct,
  orderProductsModel,
  ordersModel,
  Product,
  productsModel,
  User,
  usersModel,
} from '../../models';

describe('-Test orderProducts model:-', () => {
  const testUser: User = {
      username: 'testUser',
      firstname: 'test',
      lastname: 'test',
      role: 'user',
      password: '123456789',
    },
    testProduct: Product = {
      product_name: 'testProduct',
      price: 6,
    },
    testOrder: Order = {
      status: 'active',
      user_id: 0,
    },
    testOrderProduct: OrderProduct = {
      quantity: 2,
      order_id: 0,
      product_id: 0,
    };
  let insertedTestOrderProduct: OrderProduct;

  beforeAll(async () => {
    const createdUser: QueryResult = await usersModel.create(testUser);

    if (createdUser.rowCount < 1)
      throw new Error('Failed to create test user account');

    testOrder.user_id = testUser.id = createdUser.rows[0].id;

    const createdProduct: QueryResult = await productsModel.create(testProduct);

    if (createdProduct.rowCount < 1)
      throw new Error('Failed to create test product');

    testOrderProduct.product_id = testProduct.id = createdProduct.rows[0].id;

    const createdOrderProduct: QueryResult = await ordersModel.create(
      testOrder
    );

    if (createdOrderProduct.rowCount < 1)
      throw new Error('Failed to create test product');

    testOrderProduct.order_id = testOrder.id = createdOrderProduct.rows[0].id;
  });

  afterAll(async () => {
    await usersModel.delete({ id: testUser.id });
    await productsModel.delete({ id: testProduct.id });
    await ordersModel.delete({ id: testOrder.id });
  });

  describe('--Method: orderProductsModel.create(orderProduct):-', () => {
    it('--Should be create orderProduct in DB.', async () => {
      const promise = orderProductsModel.create(testOrderProduct);
      await expectAsync(promise).toBeResolved();
      const result: QueryResult = await promise;
      expect(result.rowCount).toBe(1);
      expect(result.rows[0].id).toBeTruthy();
      insertedTestOrderProduct = result.rows[0];
    });

    it('--Should be rejected with an error if the data passed is invalid for the orderProduct schema', async () => {
      const promise = orderProductsModel.create({
        order_id: 55,
      } as OrderProduct);
      await expectAsync(promise).toBeRejectedWithError(Error);
    });
  });

  describe('--Method: orderProductsModel.findOne(selectOptions):-', () => {
    it('--Should be get orderProduct from DB.', async () => {
      const promise = orderProductsModel.findOne({
        condition: { id: insertedTestOrderProduct.id },
      });
      await expectAsync(promise).toBeResolved();
      const orderProduct = await promise;
      expect(orderProduct).toEqual(insertedTestOrderProduct);
    });

    it('--Should be resolved to null if the requested orderProduct is not in the database.', async () => {
      const promise = orderProductsModel.findOne({
        condition: { id: 555 },
      });
      await expectAsync(promise).toBeResolved();
      const orderProduct = await promise;
      expect(orderProduct).toEqual(null);
    });
  });

  describe('--Method: orderProductsModel.index(selectOptions):-', () => {
    it('--Should be get orderProducts list from DB.', async () => {
      const promise = orderProductsModel.index();
      await expectAsync(promise).toBeResolved();
      const orderProducts = await promise;
      expect(orderProducts).toEqual([insertedTestOrderProduct]);
    });
  });

  describe('--Method: orderProductsModel.update({changes,conditions}):-', () => {
    const newQuantity: OrderProduct['quantity'] = 10;
    it('--Should be update orderProduct in DB.', async () => {
      const promise = orderProductsModel.update({
        changes: { quantity: newQuantity },
        condition: { id: insertedTestOrderProduct.id },
      });
      await expectAsync(promise).toBeResolved();
      const result: QueryResult = await promise;
      expect(result.rowCount).toBe(1);
      expect(result.rows[0].quantity).toEqual(newQuantity);
    });
  });

  describe('--Method: orderProductsModel.checkExistence(searchCondition):-', () => {
    it('--Should be resolved to true if orderProduct exists in DB.', async () => {
      const promise = orderProductsModel.checkExistence({
        id: insertedTestOrderProduct.id,
      });
      await expectAsync(promise).toBeResolved();
      const result: Boolean = await promise;
      expect(result).toBeTrue();
    });
    it("--Should be resolved to false if orderProduct isn't exists in DB.", async () => {
      const promise = orderProductsModel.checkExistence({
        id: 55,
      });
      await expectAsync(promise).toBeResolved();
      const result: Boolean = await promise;
      expect(result).toBeFalse();
    });
  });

  describe('--Method: orderProductsModel.delete(conditions):-', () => {
    it('--Should be delete orderProduct from DB.', async () => {
      const promise = orderProductsModel.delete({
        id: insertedTestOrderProduct.id,
      });
      await expectAsync(promise).toBeResolved();
      const result: QueryResult = await promise;
      expect(result.rowCount).toBe(1);
    });
  });
});
