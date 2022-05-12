import app from '../../app';
import { QueryResult } from 'pg';
import { Product, productsModel, User, usersModel } from '../../models';
import supertest, { SuperTest, Test } from 'supertest';
import { authenticate } from '../../services';
import { hashingPassword } from '../../helpers';
import {
  EndpointSuiteData,
  EndpointSuiteInitData,
  globalResponseTests,
} from '../jasmine_helpers/endpoints.helpers';

const agent: SuperTest<Test> = supertest(app);

describe('-Test products endpoints:-', () => {
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
    };

  let testProduct: Product = {
      product_name: 'testProduct',
      price: 50,
    },
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
      });

    if (createdUser.rowCount < 1 || createdAdmin.rowCount < 1)
      throw new Error('Failed to create test user and/or admin account');

    testUser.id = createdUser.rows[0].id;
    testAdmin.id = createdAdmin.rows[0].id;

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
  });

  describe('--Endpoint: POST /products (Without token):-', () => {
    const suiteData: EndpointSuiteInitData = {
      response: void 0,
    };

    beforeAll(async () => {
      suiteData.response = await agent.post('/products').send(testProduct);
    });

    globalResponseTests({ suiteData, statusCode: 401, textStatus: 'fail' });

    it('--body.data._message must be equal "Login required."', async () => {
      const { response } = suiteData as EndpointSuiteData;
      expect(response.body.data._message).toBe('Login required.');
    });
  });

  describe('--Endpoint: POST /products (With invalid token):-', () => {
    const suiteData: EndpointSuiteInitData = {
      response: void 0,
    };

    beforeAll(async () => {
      suiteData.response = await agent
        .post('/products')
        .set('Authorization', 'Bearer invalidToken')
        .send(testProduct);
    });

    globalResponseTests({ suiteData, statusCode: 401, textStatus: 'fail' });

    it('--body.data._message must be equal "Authorization failure."', async () => {
      const { response } = suiteData as EndpointSuiteData;
      expect(response.body.data._message).toBe('Authorization failure.');
    });
  });

  describe('--Endpoint: POST /products (With valid token | user role):-', () => {
    const suiteData: EndpointSuiteInitData = {
      response: void 0,
    };

    beforeAll(async () => {
      suiteData.response = await agent
        .post('/products')
        .set('Authorization', `Bearer ${testUserToken}`)
        .send(testProduct);
    });

    globalResponseTests({ suiteData, statusCode: 403, textStatus: 'fail' });

    it('--body.data._message must be equal "Not allowed endpoint for your account."', async () => {
      const { response } = suiteData as EndpointSuiteData;
      expect(response.body.data._message).toBe(
        'Not allowed endpoint for your account.'
      );
    });
  });

  describe('--Endpoint: POST /products (With valid token | admin role):-', () => {
    const suiteData: EndpointSuiteInitData = {
      response: void 0,
    };

    beforeAll(async () => {
      suiteData.response = await agent
        .post(`/products`)
        .set('Authorization', `Bearer ${testAdminToken}`)
        .send(testProduct);
    });

    globalResponseTests({ suiteData, statusCode: 201 });

    it('--body.data must be contain created product data', async () => {
      const { response } = suiteData as EndpointSuiteData;
      const productData: Partial<Product> = Object.assign(
        {},
        response.body.data
      );
      delete productData.id;
      expect(productData).toEqual(testProduct);
      testProduct.id = response.body.data.id;
    });

    it('--Product must be inserted in DB.', async () => {
      const { response } = suiteData as EndpointSuiteData;
      expect(
        await productsModel.checkExistence({ id: response.body.data.id })
      ).toBeTruthy();
    });
  });

  describe('--Endpoint: GET /products/:id:-', () => {
    const suiteData: EndpointSuiteInitData = {
      response: void 0,
    };

    beforeAll(async () => {
      suiteData.response = await agent
        .get(`/products/${testProduct.id}`)
        .set('Authorization', `Bearer ${testAdminToken}`);
    });

    globalResponseTests({ suiteData });

    it('--body.data must be contain product data', async () => {
      const { response } = suiteData as EndpointSuiteData;
      expect(response.body.data).toEqual(testProduct);
    });
  });

  describe('--Endpoint: GET /products:-', () => {
    const suiteData: EndpointSuiteInitData = {
      response: void 0,
    };

    beforeAll(async () => {
      suiteData.response = await agent
        .get(`/products`)
        .set('Authorization', `Bearer ${testAdminToken}`);
    });

    globalResponseTests({ suiteData });

    it('--body.data must be contain products data', async () => {
      const { response } = suiteData as EndpointSuiteData;
      expect(response.body.data).toEqual([testProduct]);
    });
  });

  describe('--Endpoint: PUT /products/:id (Without token):-', () => {
    const suiteData: EndpointSuiteInitData = {
      response: void 0,
    };

    beforeAll(async () => {
      suiteData.response = await agent.put(`/products/${testProduct.id}`);
    });

    globalResponseTests({ suiteData, statusCode: 401, textStatus: 'fail' });

    it('--body.data._message must be equal "Login required."', async () => {
      const { response } = suiteData as EndpointSuiteData;
      expect(response.body.data._message).toBe('Login required.');
    });
  });

  describe('--Endpoint: PUT /products/:id (With invalid token):-', () => {
    const suiteData: EndpointSuiteInitData = {
      response: void 0,
    };

    beforeAll(async () => {
      suiteData.response = await agent
        .put(`/products/${testProduct.id}`)
        .set('Authorization', 'Bearer invalidToken');
    });

    globalResponseTests({ suiteData, statusCode: 401, textStatus: 'fail' });

    it('--body.data._message must be equal "Authorization failure."', async () => {
      const { response } = suiteData as EndpointSuiteData;
      expect(response.body.data._message).toBe('Authorization failure.');
    });
  });

  describe('--Endpoint: PUT /products/:id (With valid token | user role):-', () => {
    const suiteData: EndpointSuiteInitData = {
      response: void 0,
    };

    beforeAll(async () => {
      suiteData.response = await agent
        .put(`/products/${testProduct.id}`)
        .set('Authorization', `Bearer ${testUserToken}`);
    });

    globalResponseTests({ suiteData, statusCode: 403, textStatus: 'fail' });

    it('--body.data._message must be equal "Not allowed endpoint for your account."', async () => {
      const { response } = suiteData as EndpointSuiteData;
      expect(response.body.data._message).toBe(
        'Not allowed endpoint for your account.'
      );
    });
  });

  describe('--Endpoint: PUT /products/:id (With valid token | admin role):-', () => {
    const suiteData: EndpointSuiteInitData<Product> = {
      response: void 0,
      changes: {
        product_name: 'updatedProductName',
      },
    };

    beforeAll(async () => {
      testProduct = { ...testProduct, ...suiteData.changes };

      suiteData.response = await agent
        .put(`/products/${testProduct.id}`)
        .set('Authorization', `Bearer ${testAdminToken}`)
        .send(suiteData.changes);
    });

    globalResponseTests({ suiteData });

    it('--body.data must be contain updated product data', async () => {
      const { response } = suiteData as EndpointSuiteData;
      expect(response.body.data).toEqual(testProduct);
    });
    it('--Product must be updated in DB.', async () => {
      const { response } = suiteData as EndpointSuiteData;
      expect(
        await productsModel.checkExistence({
          id: response.body.data.id,
          product_name: testProduct.product_name,
        })
      ).toBeTruthy();
    });
  });

  describe('--Endpoint: DELETE /products/:id (Without token):-', () => {
    const suiteData: EndpointSuiteInitData = {
      response: void 0,
    };

    beforeAll(async () => {
      suiteData.response = await agent.delete(`/products/${testProduct.id}`);
    });

    globalResponseTests({ suiteData, statusCode: 401, textStatus: 'fail' });

    it('--body.data._message must be equal "Login required."', async () => {
      const { response } = suiteData as EndpointSuiteData;
      expect(response.body.data._message).toBe('Login required.');
    });
  });

  describe('--Endpoint: DELETE /products/:id (With invalid token):-', () => {
    const suiteData: EndpointSuiteInitData = {
      response: void 0,
    };

    beforeAll(async () => {
      suiteData.response = await agent
        .delete(`/products/${testProduct.id}`)
        .set('Authorization', 'Bearer invalidToken');
    });

    globalResponseTests({ suiteData, statusCode: 401, textStatus: 'fail' });

    it('--body.data._message must be equal "Authorization failure."', async () => {
      const { response } = suiteData as EndpointSuiteData;
      expect(response.body.data._message).toBe('Authorization failure.');
    });
  });

  describe('--Endpoint: DELETE /products/:id (With valid token | user role):-', () => {
    const suiteData: EndpointSuiteInitData = {
      response: void 0,
    };

    beforeAll(async () => {
      suiteData.response = await agent
        .delete(`/products/${testProduct.id}`)
        .set('Authorization', `Bearer ${testUserToken}`);
    });

    globalResponseTests({ suiteData, statusCode: 403, textStatus: 'fail' });

    it('--body.data._message must be equal "Not allowed endpoint for your account."', async () => {
      const { response } = suiteData as EndpointSuiteData;
      expect(response.body.data._message).toBe(
        'Not allowed endpoint for your account.'
      );
    });
  });

  describe('--Endpoint: DELETE /products/:id (With valid token | admin role):-', () => {
    const suiteData: EndpointSuiteInitData = {
      response: void 0,
    };

    beforeAll(async () => {
      suiteData.response = await agent
        .delete(`/products/${testProduct.id}`)
        .set('Authorization', `Bearer ${testAdminToken}`);
    });

    globalResponseTests({ suiteData });

    it('--body.data must be contain deleted product data', async () => {
      const { response } = suiteData as EndpointSuiteData;
      expect(response.body.data).toEqual(testProduct);
    });
    it('--Product must be deleted from DB.', async () => {
      const { response } = suiteData as EndpointSuiteData;
      expect(
        await productsModel.checkExistence({ id: response.body.data.id })
      ).toBeFalsy();
    });
  });
});
