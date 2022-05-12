import app from '../../app';
import { QueryResult } from 'pg';
import {
  FullOrderLookup,
  Order,
  OrderProduct,
  orderProductsModel,
  ordersModel,
  Product,
  productsModel,
  User,
  usersModel,
} from '../../models';
import supertest, { SuperTest, Test } from 'supertest';
import { authenticate } from '../../services';
import { hashingPassword } from '../../helpers';
import {
  EndpointSuiteData,
  EndpointSuiteInitData,
  globalResponseTests,
} from '../jasmine_helpers/endpoints.helpers';

const agent: SuperTest<Test> = supertest(app);

describe('-Test orders endpoints:-', () => {
  const testAdmin: User = {
      username: 'testAdmin',
      firstname: 'test',
      lastname: 'test',
      role: 'admin',
      password: '123456789',
    },
    testUser: User = {
      username: 'testUser',
      firstname: 'test',
      lastname: 'test',
      role: 'user',
      password: '123456789',
    },
    testProduct: Product = {
      product_name: 'testProduct',
      price: 50,
    },
    testOrderProduct: Partial<OrderProduct> = {
      quantity: 6,
      product_id: 0,
    };

  let testOrder: Order = {
      status: 'active',
      user_id: 0,
    },
    testOrderWithLookup: FullOrderLookup | null,
    testAdminToken: string | null,
    testUserToken: string | null;

  beforeAll(async () => {
    const userHashedPassword = await hashingPassword(testUser.password),
      adminHashedPassword = await hashingPassword(testAdmin.password),
      createdUser: QueryResult = await usersModel.create({
        ...testUser,
        password: userHashedPassword,
      }),
      createdAdmin: QueryResult = await usersModel.create({
        ...testAdmin,
        password: adminHashedPassword,
      }),
      createdProduct: QueryResult = await productsModel.create(testProduct);

    if (createdUser.rowCount < 1 || createdAdmin.rowCount < 1)
      throw new Error('Failed to create test user and/or admin account');

    if (createdProduct.rowCount < 1)
      throw new Error('Failed to create test product');

    testUser.id = testOrder.user_id = createdUser.rows[0].id;
    testAdmin.id = createdAdmin.rows[0].id;
    testProduct.id = testOrderProduct.product_id = createdProduct.rows[0].id;

    testUserToken = await authenticate({
      username: testUser.username,
      password: testUser.password,
    });
    testAdminToken = await authenticate({
      username: testAdmin.username,
      password: testAdmin.password,
    });

    if (!testUserToken || !testAdminToken)
      throw new Error('authentication failed');
  });

  afterAll(async () => {
    await usersModel.delete({ id: testAdmin.id });
    await usersModel.delete({ id: testUser.id });
    await productsModel.delete({ id: testProduct.id });
  });

  describe('--Endpoint: POST /orders (Without token):-', () => {
    const suiteData: EndpointSuiteInitData = {
      response: void 0,
    };

    beforeAll(async () => {
      suiteData.response = await agent.post('/orders').send(testOrder);
    });

    globalResponseTests({ suiteData, statusCode: 401, textStatus: 'fail' });

    it('--body.data._message must be equal "Login required."', async () => {
      const { response } = suiteData as EndpointSuiteData;
      expect(response.body.data._message).toBe('Login required.');
    });
  });

  describe('--Endpoint: POST /orders (With invalid token):-', () => {
    const suiteData: EndpointSuiteInitData = {
      response: void 0,
    };

    beforeAll(async () => {
      suiteData.response = await agent
        .post('/orders')
        .set('Authorization', 'Bearer invalidToken')
        .send(testOrder);
    });

    globalResponseTests({ suiteData, statusCode: 401, textStatus: 'fail' });

    it('--body.data._message must be equal "Authorization failure."', async () => {
      const { response } = suiteData as EndpointSuiteData;
      expect(response.body.data._message).toBe('Authorization failure.');
    });
  });

  describe('--Endpoint: POST /orders (With valid token):-', () => {
    const suiteData: EndpointSuiteInitData = {
      response: void 0,
    };

    beforeAll(async () => {
      suiteData.response = await agent
        .post(`/orders`)
        .set('Authorization', `Bearer ${testUserToken}`)
        .send(testOrder);
    });

    globalResponseTests({ suiteData, statusCode: 201 });

    it('--body.data must be contain created order data', async () => {
      const { response } = suiteData as EndpointSuiteData;
      const orderData: Partial<Order> = Object.assign({}, response.body.data);
      delete orderData.id;
      expect(orderData).toEqual(testOrder);
      testOrder.id = response.body.data.id;
    });

    it('--Order must be inserted in DB.', async () => {
      const { response } = suiteData as EndpointSuiteData;
      expect(
        await ordersModel.checkExistence({ id: response.body.data.id })
      ).toBeTruthy();
    });
  });

  describe('--Endpoint: POST /orders/:id/products (Without token):-', () => {
    const suiteData: EndpointSuiteInitData = {
      response: void 0,
    };

    beforeAll(async () => {
      suiteData.response = await agent
        .post(`/orders/${testOrder.id}/products`)
        .send(testOrderProduct);
    });

    globalResponseTests({ suiteData, statusCode: 401, textStatus: 'fail' });

    it('--body.data._message must be equal "Login required."', async () => {
      const { response } = suiteData as EndpointSuiteData;
      expect(response.body.data._message).toBe('Login required.');
    });
  });

  describe('--Endpoint: POST /orders/:id/products (With invalid token):-', () => {
    const suiteData: EndpointSuiteInitData = {
      response: void 0,
    };

    beforeAll(async () => {
      suiteData.response = await agent
        .post(`/orders/${testOrder.id}/products`)
        .set('Authorization', 'Bearer invalidToken')
        .send(testOrderProduct);
    });

    globalResponseTests({ suiteData, statusCode: 401, textStatus: 'fail' });

    it('--body.data._message must be equal "Authorization failure."', async () => {
      const { response } = suiteData as EndpointSuiteData;
      expect(response.body.data._message).toBe('Authorization failure.');
    });
  });

  describe('--Endpoint: POST /orders/:id/products (With valid token):-', () => {
    const suiteData: EndpointSuiteInitData = {
      response: void 0,
    };

    beforeAll(async () => {
      suiteData.response = await agent
        .post(`/orders/${testOrder.id}/products`)
        .set('Authorization', `Bearer ${testUserToken}`)
        .send(testOrderProduct);
    });

    globalResponseTests({ suiteData, statusCode: 201 });

    it('--body.data must be contain created order product data', async () => {
      const { response } = suiteData as EndpointSuiteData;
      testOrderProduct.id = response.body.data.id;
      testOrderProduct.order_id = testOrder.id;
      testOrderWithLookup = {
        ...testOrder,
        username: testUser.username,
        user_id: testUser.id as number,
        order_products: [
          {
            id: testOrderProduct.id,
            quantity: testOrderProduct.quantity,
            product: testProduct as Product,
          },
        ],
      };
      expect(response.body.data).toEqual(testOrderProduct);
    });

    it('--Order order product must be inserted in DB.', async () => {
      expect(
        await orderProductsModel.checkExistence(testOrderProduct)
      ).toBeTruthy();
    });
  });

  describe('--Endpoint: GET /orders/:id (Without token):-', () => {
    const suiteData: EndpointSuiteInitData = {
      response: void 0,
    };

    beforeAll(async () => {
      suiteData.response = await agent.get(`/orders/${testOrder.id}`);
    });

    globalResponseTests({ suiteData, statusCode: 401, textStatus: 'fail' });

    it('--body.data._message must be equal "Login required."', async () => {
      const { response } = suiteData as EndpointSuiteData;
      expect(response.body.data._message).toBe('Login required.');
    });
  });

  describe('--Endpoint: GET /orders/:id (With invalid token):-', () => {
    const suiteData: EndpointSuiteInitData = {
      response: void 0,
    };

    beforeAll(async () => {
      suiteData.response = await agent
        .get(`/orders/${testOrder.id}`)
        .set('Authorization', 'Bearer invalidToken');
    });

    globalResponseTests({ suiteData, statusCode: 401, textStatus: 'fail' });

    it('--body.data._message must be equal "Authorization failure."', async () => {
      const { response } = suiteData as EndpointSuiteData;
      expect(response.body.data._message).toBe('Authorization failure.');
    });
  });

  describe('--Endpoint: GET /orders/:id (With valid token):-', () => {
    const suiteData: EndpointSuiteInitData = {
      response: void 0,
    };

    beforeAll(async () => {
      suiteData.response = await agent
        .get(`/orders/${testOrder.id}`)
        .set('Authorization', `Bearer ${testUserToken}`);
    });

    globalResponseTests({ suiteData });

    it('--body.data must be contain order data (With full orders lookup)', async () => {
      const { response } = suiteData as EndpointSuiteData;
      expect(response.body.data).toEqual(testOrderWithLookup);
    });
  });

  describe('--Endpoint: GET /orders/active (Without token):-', () => {
    const suiteData: EndpointSuiteInitData = {
      response: void 0,
    };

    beforeAll(async () => {
      suiteData.response = await agent.get(`/orders/active`);
    });

    globalResponseTests({ suiteData, statusCode: 401, textStatus: 'fail' });

    it('--body.data._message must be equal "Login required."', async () => {
      const { response } = suiteData as EndpointSuiteData;
      expect(response.body.data._message).toBe('Login required.');
    });
  });

  describe('--Endpoint: GET /orders/active (With invalid token):-', () => {
    const suiteData: EndpointSuiteInitData = {
      response: void 0,
    };

    beforeAll(async () => {
      suiteData.response = await agent
        .get(`/orders/active`)
        .set('Authorization', 'Bearer invalidToken');
    });

    globalResponseTests({ suiteData, statusCode: 401, textStatus: 'fail' });

    it('--body.data._message must be equal "Authorization failure."', async () => {
      const { response } = suiteData as EndpointSuiteData;
      expect(response.body.data._message).toBe('Authorization failure.');
    });
  });

  describe('--Endpoint: GET /orders/active (With valid token):-', () => {
    const suiteData: EndpointSuiteInitData = {
      response: void 0,
    };

    beforeAll(async () => {
      suiteData.response = await agent
        .get(`/orders/active`)
        .set('Authorization', `Bearer ${testUserToken}`);
    });

    globalResponseTests({ suiteData });

    it('--body.data must be contain order data (With full orders lookup)', async () => {
      const { response } = suiteData as EndpointSuiteData;
      expect(response.body.data).toEqual(testOrderWithLookup);
    });
  });

  describe('--Endpoint: GET /orders?user_id=x&status=x :-', () => {
    const suiteData: EndpointSuiteInitData = {
      response: void 0,
    };

    beforeAll(async () => {
      suiteData.response = await agent
        .get(`/orders?user_id=${testUser.id}&status=active`)
        .set('Authorization', `Bearer ${testAdminToken}`);
    });

    globalResponseTests({ suiteData });

    it('--body.data must be contain orders data', async () => {
      const { response } = suiteData as EndpointSuiteData;
      expect(response.body.data).toEqual([testOrderWithLookup]);
    });
  });

  describe('--Endpoint: DELETE /orders/:id/products/:order_product_id (Without token):-', () => {
    const suiteData: EndpointSuiteInitData = {
      response: void 0,
    };

    beforeAll(async () => {
      suiteData.response = await agent
        .delete(`/orders/${testOrder.id}/products/${testOrderProduct.id}`)
        .send(testOrderProduct);
    });

    globalResponseTests({ suiteData, statusCode: 401, textStatus: 'fail' });

    it('--body.data._message must be equal "Login required."', async () => {
      const { response } = suiteData as EndpointSuiteData;
      expect(response.body.data._message).toBe('Login required.');
    });
  });

  describe('--Endpoint: DELETE /orders/:id/products/:order_product_id (With invalid token):-', () => {
    const suiteData: EndpointSuiteInitData = {
      response: void 0,
    };

    beforeAll(async () => {
      suiteData.response = await agent
        .delete(`/orders/${testOrder.id}/products/${testOrderProduct.id}`)
        .set('Authorization', 'Bearer invalidToken');
    });

    globalResponseTests({ suiteData, statusCode: 401, textStatus: 'fail' });

    it('--body.data._message must be equal "Authorization failure."', async () => {
      const { response } = suiteData as EndpointSuiteData;
      expect(response.body.data._message).toBe('Authorization failure.');
    });
  });

  describe('--Endpoint: DELETE /orders/:id/products/:order_product_id (With valid token):-', () => {
    const suiteData: EndpointSuiteInitData = {
      response: void 0,
    };

    beforeAll(async () => {
      suiteData.response = await agent
        .delete(`/orders/${testOrder.id}/products/${testOrderProduct.id}`)
        .set('Authorization', `Bearer ${testUserToken}`);
    });

    globalResponseTests({ suiteData });

    it('--body.data must be contain deleted order product data', async () => {
      const { response } = suiteData as EndpointSuiteData;
      expect(response.body.data).toEqual(testOrderProduct);
    });

    it('--Order order product must be deleted from DB.', async () => {
      expect(
        await orderProductsModel.checkExistence(testOrderProduct)
      ).toBeFalsy();
    });
  });

  describe('--Endpoint: PUT /orders/:id/complete (Without token):-', () => {
    const suiteData: EndpointSuiteInitData = {
      response: void 0,
    };

    beforeAll(async () => {
      suiteData.response = await agent.put(`/orders/${testOrder.id}/complete`);
    });

    globalResponseTests({ suiteData, statusCode: 401, textStatus: 'fail' });

    it('--body.data._message must be equal "Login required."', async () => {
      const { response } = suiteData as EndpointSuiteData;
      expect(response.body.data._message).toBe('Login required.');
    });
  });

  describe('--Endpoint: PUT /orders/:id/complete (With invalid token):-', () => {
    const suiteData: EndpointSuiteInitData = {
      response: void 0,
    };

    beforeAll(async () => {
      suiteData.response = await agent
        .put(`/orders/${testOrder.id}/complete`)
        .set('Authorization', 'Bearer invalidToken');
    });

    globalResponseTests({ suiteData, statusCode: 401, textStatus: 'fail' });

    it('--body.data._message must be equal "Authorization failure."', async () => {
      const { response } = suiteData as EndpointSuiteData;
      expect(response.body.data._message).toBe('Authorization failure.');
    });
  });

  describe('--Endpoint: PUT /orders/:id/complete (With valid token):-', () => {
    const suiteData: EndpointSuiteInitData<Order> = {
      response: void 0,
      changes: {
        status: 'complete',
      },
    };

    beforeAll(async () => {
      testOrder = { ...testOrder, ...suiteData.changes };

      suiteData.response = await agent
        .put(`/orders/${testOrder.id}/complete`)
        .set('Authorization', `Bearer ${testUserToken}`)
        .send(suiteData.changes);
    });

    globalResponseTests({ suiteData });

    it('--body.data must be contain updated order data', async () => {
      const { response } = suiteData as EndpointSuiteData;
      expect(response.body.data).toEqual(testOrder);
    });
    it('--Order must be updated in DB.', async () => {
      const { response } = suiteData as EndpointSuiteData;
      expect(
        await ordersModel.checkExistence({
          id: response.body.data.id,
          status: testOrder.status,
        })
      ).toBeTruthy();
    });
  });

  describe('--Endpoint: DELETE /orders/:id (Without token):-', () => {
    const suiteData: EndpointSuiteInitData = {
      response: void 0,
    };

    beforeAll(async () => {
      suiteData.response = await agent.delete(`/orders/${testOrder.id}`);
    });

    globalResponseTests({ suiteData, statusCode: 401, textStatus: 'fail' });

    it('--body.data._message must be equal "Login required."', async () => {
      const { response } = suiteData as EndpointSuiteData;
      expect(response.body.data._message).toBe('Login required.');
    });
  });

  describe('--Endpoint: DELETE /orders/:id (With invalid token):-', () => {
    const suiteData: EndpointSuiteInitData = {
      response: void 0,
    };

    beforeAll(async () => {
      suiteData.response = await agent
        .delete(`/orders/${testOrder.id}`)
        .set('Authorization', 'Bearer invalidToken');
    });

    globalResponseTests({ suiteData, statusCode: 401, textStatus: 'fail' });

    it('--body.data._message must be equal "Authorization failure."', async () => {
      const { response } = suiteData as EndpointSuiteData;
      expect(response.body.data._message).toBe('Authorization failure.');
    });
  });

  describe('--Endpoint: DELETE /orders/:id (With valid token):-', () => {
    const suiteData: EndpointSuiteInitData = {
      response: void 0,
    };

    beforeAll(async () => {
      suiteData.response = await agent
        .delete(`/orders/${testOrder.id}`)
        .set('Authorization', `Bearer ${testUserToken}`);
    });

    globalResponseTests({ suiteData });

    it('--body.data must be contain deleted order data', async () => {
      const { response } = suiteData as EndpointSuiteData;
      expect(response.body.data).toEqual(testOrder);
    });
    it('--Order must be deleted from DB.', async () => {
      const { response } = suiteData as EndpointSuiteData;
      expect(
        await ordersModel.checkExistence({ id: response.body.data.id })
      ).toBeFalsy();
    });
  });
});
