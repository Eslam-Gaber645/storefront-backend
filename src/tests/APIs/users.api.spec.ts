import app from '../../app';
import { QueryResult } from 'pg';
import { User, usersModel } from '../../models';
import supertest, { SuperTest, Test } from 'supertest';
import { authenticate } from '../../services';
import { hashingPassword } from '../../helpers';
import {
  EndpointSuiteData,
  EndpointSuiteInitData,
  globalResponseTests,
} from '../jasmine_helpers/endpoints.helpers';

const agent: SuperTest<Test> = supertest(app);

describe('-Test users endpoints:-', () => {
  const testAdmin: User = {
      username: 'testAdmin',
      firstname: 'test',
      lastname: 'test',
      role: 'admin',
      password: '123456789',
    },
    testSignupUser: User = {
      username: 'testSignupUser',
      firstname: 'test',
      lastname: 'test',
      role: 'user',
      password: '123456789',
    },
    testCreatedUser: User = {
      username: 'testCreatedUser',
      firstname: 'test',
      lastname: 'test',
      role: 'user',
      password: '123456789',
    },
    testAdminWithoutPassword: Partial<User> = Object.assign({}, testAdmin),
    testSignupUserWithoutPassword: Partial<User> = Object.assign(
      {},
      testSignupUser
    ),
    testCreatedUserWithoutPassword: Partial<User> = Object.assign(
      {},
      testCreatedUser
    );
  delete testAdminWithoutPassword.password;
  delete testSignupUserWithoutPassword.password;
  delete testCreatedUserWithoutPassword.password;

  let testAdminToken: string | null, testUserToken: string | null;

  beforeAll(async () => {
    const hashedPassword = await hashingPassword(testAdmin.password),
      createdUser: QueryResult = await usersModel.create({
        ...testAdmin,
        password: hashedPassword,
      });

    if (createdUser.rowCount < 1)
      throw new Error('Failed to create test user account');

    testAdmin.id = createdUser.rows[0].id;

    testAdminToken = await authenticate({
      username: testAdmin.username,
      password: testAdmin.password,
    });

    if (!testAdminToken) throw new Error('authentication failed');
  });

  afterAll(async () => {
    await usersModel.delete({ id: testAdmin.id });
    await usersModel.delete({ id: testCreatedUser.id });
  });

  describe('--Endpoint: POST /users/signup :-', () => {
    const suiteData: EndpointSuiteInitData = {
      response: void 0,
    };

    beforeAll(async () => {
      suiteData.response = await agent
        .post('/users/signup')
        .send(testSignupUser);
    });

    globalResponseTests({ suiteData, statusCode: 201 });

    it('--body.data must be contain created user data (without password)', async () => {
      const { response } = suiteData as EndpointSuiteData;
      const userData: Partial<User> = Object.assign({}, response.body.data);
      delete userData.id;
      expect(userData).toEqual(testSignupUserWithoutPassword);
      testSignupUser.id = response.body.data.id;
    });
    it('--User must be inserted in DB.', async () => {
      const { response } = suiteData as EndpointSuiteData;
      expect(
        await usersModel.checkExistence({ id: response.body.data.id })
      ).toBeTruthy();
    });
  });

  describe('--Endpoint: POST /users/login :-', () => {
    const suiteData: EndpointSuiteInitData = {
      response: void 0,
    };

    beforeAll(async () => {
      suiteData.response = await agent.post('/users/login').send({
        username: testSignupUser.username,
        password: testSignupUser.password,
      });
    });

    globalResponseTests({ suiteData });

    it('--body.data.token must be contain auth token', async () => {
      const { response } = suiteData as EndpointSuiteData;
      const token: string = response.body.data.token;
      expect(typeof token === 'string').toBeTruthy();
      expect(token.length).toBeGreaterThan(10);
      testUserToken = token;
    });
  });

  describe('--Endpoint: GET /users/:id (Without token):-', () => {
    const suiteData: EndpointSuiteInitData = {
      response: void 0,
    };

    beforeAll(async () => {
      suiteData.response = await agent.get(`/users/${testSignupUser.id}`);
    });

    globalResponseTests({ suiteData, statusCode: 401, textStatus: 'fail' });

    it('--body.data._message must be equal "Login required."', async () => {
      const { response } = suiteData as EndpointSuiteData;
      expect(response.body.data._message).toBe('Login required.');
    });
  });

  describe('--Endpoint: GET /users/:id (With invalid token):-', () => {
    const suiteData: EndpointSuiteInitData = {
      response: void 0,
    };

    beforeAll(async () => {
      suiteData.response = await agent
        .get(`/users/${testSignupUser.id}`)
        .set('Authorization', 'Bearer invalidToken');
    });

    globalResponseTests({ suiteData, statusCode: 401, textStatus: 'fail' });

    it('--body.data._message must be equal "Authorization failure."', async () => {
      const { response } = suiteData as EndpointSuiteData;
      expect(response.body.data._message).toBe('Authorization failure.');
    });
  });

  describe('--Endpoint: GET /users/:id (With valid token):-', () => {
    const suiteData: EndpointSuiteInitData = {
      response: void 0,
    };

    beforeAll(async () => {
      suiteData.response = await agent
        .get(`/users/${testSignupUser.id}`)
        .set('Authorization', `Bearer ${testAdminToken}`);
    });

    globalResponseTests({ suiteData });

    it('--body.data must be contain user data (without password)', async () => {
      const { response } = suiteData as EndpointSuiteData;
      const userData: Partial<User> = Object.assign({}, response.body.data);
      delete userData.id;
      expect(userData).toEqual(testSignupUserWithoutPassword);
    });
  });

  describe('--Endpoint: GET /users (Without token):-', () => {
    const suiteData: EndpointSuiteInitData = {
      response: void 0,
    };

    beforeAll(async () => {
      suiteData.response = await agent.get(`/users`);
    });

    globalResponseTests({ suiteData, statusCode: 401, textStatus: 'fail' });

    it('--body.data._message must be equal "Login required."', async () => {
      const { response } = suiteData as EndpointSuiteData;
      expect(response.body.data._message).toBe('Login required.');
    });
  });

  describe('--Endpoint: GET /users (With invalid token):-', () => {
    const suiteData: EndpointSuiteInitData = {
      response: void 0,
    };

    beforeAll(async () => {
      suiteData.response = await agent
        .get(`/users`)
        .set('Authorization', 'Bearer invalidToken');
    });

    globalResponseTests({ suiteData, statusCode: 401, textStatus: 'fail' });

    it('--body.data._message must be equal "Authorization failure."', async () => {
      const { response } = suiteData as EndpointSuiteData;
      expect(response.body.data._message).toBe('Authorization failure.');
    });
  });

  describe('--Endpoint: GET /users (With valid token):-', () => {
    const suiteData: EndpointSuiteInitData = {
      response: void 0,
    };

    beforeAll(async () => {
      suiteData.response = await agent
        .get(`/users`)
        .set('Authorization', `Bearer ${testAdminToken}`);
    });

    globalResponseTests({ suiteData });

    it('--body.data must be contain users data (without password)', async () => {
      const { response } = suiteData as EndpointSuiteData;
      const usersData: Partial<User>[] = response.body.data;
      usersData.forEach(u => {
        delete u.id;
      });
      expect(usersData).toEqual([
        testAdminWithoutPassword,
        testSignupUserWithoutPassword,
      ]);
    });
  });

  describe('--Endpoint: POST /users (Without token):-', () => {
    const suiteData: EndpointSuiteInitData = {
      response: void 0,
    };

    beforeAll(async () => {
      suiteData.response = await agent.post('/users').send(testCreatedUser);
    });

    globalResponseTests({ suiteData, statusCode: 401, textStatus: 'fail' });

    it('--body.data._message must be equal "Login required."', async () => {
      const { response } = suiteData as EndpointSuiteData;
      expect(response.body.data._message).toBe('Login required.');
    });
  });

  describe('--Endpoint: POST /users (With invalid token):-', () => {
    const suiteData: EndpointSuiteInitData = {
      response: void 0,
    };

    beforeAll(async () => {
      suiteData.response = await agent
        .post('/users')
        .set('Authorization', 'Bearer invalidToken')
        .send(testCreatedUser);
    });

    globalResponseTests({ suiteData, statusCode: 401, textStatus: 'fail' });

    it('--body.data._message must be equal "Authorization failure."', async () => {
      const { response } = suiteData as EndpointSuiteData;
      expect(response.body.data._message).toBe('Authorization failure.');
    });
  });

  describe('--Endpoint: POST /users (With valid token | user role):-', () => {
    const suiteData: EndpointSuiteInitData = {
      response: void 0,
    };

    beforeAll(async () => {
      suiteData.response = await agent
        .post('/users')
        .set('Authorization', `Bearer ${testUserToken}`)
        .send(testCreatedUser);
    });

    globalResponseTests({ suiteData, statusCode: 403, textStatus: 'fail' });

    it('--body.data._message must be equal "Not allowed endpoint for your account."', async () => {
      const { response } = suiteData as EndpointSuiteData;
      expect(response.body.data._message).toBe(
        'Not allowed endpoint for your account.'
      );
    });
  });

  describe('--Endpoint: POST /users (With valid token | admin role):-', () => {
    const suiteData: EndpointSuiteInitData = {
      response: void 0,
    };

    beforeAll(async () => {
      suiteData.response = await agent
        .post(`/users`)
        .set('Authorization', `Bearer ${testAdminToken}`)
        .send(testCreatedUser);
    });

    globalResponseTests({ suiteData, statusCode: 201 });

    it('--body.data must be contain created user data (without password)', async () => {
      const { response } = suiteData as EndpointSuiteData;
      const userData: Partial<User> = Object.assign({}, response.body.data);
      delete userData.id;
      expect(userData).toEqual(testCreatedUserWithoutPassword);
      testCreatedUser.id = response.body.data.id;
    });
    it('--User must be inserted in DB.', async () => {
      const { response } = suiteData as EndpointSuiteData;
      expect(
        await usersModel.checkExistence({ id: response.body.data.id })
      ).toBeTruthy();
    });
  });

  describe('--Endpoint: DELETE /users/:id (Without token):-', () => {
    const suiteData: EndpointSuiteInitData = {
      response: void 0,
    };

    beforeAll(async () => {
      suiteData.response = await agent.delete(`/users/${testSignupUser.id}`);
    });

    globalResponseTests({ suiteData, statusCode: 401, textStatus: 'fail' });

    it('--body.data._message must be equal "Login required."', async () => {
      const { response } = suiteData as EndpointSuiteData;
      expect(response.body.data._message).toBe('Login required.');
    });
  });

  describe('--Endpoint: DELETE /users/:id (With invalid token):-', () => {
    const suiteData: EndpointSuiteInitData = {
      response: void 0,
    };

    beforeAll(async () => {
      suiteData.response = await agent
        .delete(`/users/${testSignupUser.id}`)
        .set('Authorization', 'Bearer invalidToken');
    });

    globalResponseTests({ suiteData, statusCode: 401, textStatus: 'fail' });

    it('--body.data._message must be equal "Authorization failure."', async () => {
      const { response } = suiteData as EndpointSuiteData;
      expect(response.body.data._message).toBe('Authorization failure.');
    });
  });

  describe('--Endpoint: DELETE /users/:id (With valid token):-', () => {
    const suiteData: EndpointSuiteInitData = {
      response: void 0,
    };

    beforeAll(async () => {
      suiteData.response = await agent
        .delete(`/users/${testSignupUser.id}`)
        .set('Authorization', `Bearer ${testAdminToken}`);
    });

    globalResponseTests({ suiteData });

    it('--body.data must be contain deleted user data (without password)', async () => {
      const { response } = suiteData as EndpointSuiteData;
      const userData: Partial<User> = Object.assign({}, response.body.data);
      delete userData.id;
      expect(userData).toEqual(testSignupUserWithoutPassword);
    });
    it('--User must be deleted from DB.', async () => {
      const { response } = suiteData as EndpointSuiteData;
      expect(
        await usersModel.checkExistence({ id: response.body.data.id })
      ).toBeFalsy();
    });
  });
});
