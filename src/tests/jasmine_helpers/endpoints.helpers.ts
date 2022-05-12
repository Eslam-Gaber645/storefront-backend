import { Response } from 'supertest';

export type EndpointSuiteInitData<EntityType = object> = {
  response?: Response;
  changes?: Partial<EntityType>;
};

export type EndpointSuiteData<EntityType = object> = {
  response: Response;
  changes?: Partial<EntityType>;
};

export type CheckResponseOptions = {
  suiteData: EndpointSuiteInitData;
  statusCode?: number;
  textStatus?: 'success' | 'fail';
  dataType?: 'object' | null;
};

export function globalResponseTests({
  suiteData,
  statusCode = 200,
  textStatus = 'success',
  dataType = 'object',
}: CheckResponseOptions) {
  it(`--Status code must be ${statusCode}.`, async () => {
    const { response } = suiteData as EndpointSuiteData;
    expect(response.statusCode).toBe(statusCode);
  });
  it('--The Body must be valid JSON', async () => {
    const { response } = suiteData as EndpointSuiteData;
    expect(response.body && typeof response.body === 'object').toBeTruthy();
  });
  it(`--body.status must be equal "${textStatus}"`, async () => {
    const { response } = suiteData as EndpointSuiteData;
    expect(response.body.status).toBe(textStatus);
  });
  it(`--body.data must be ${dataType}.`, async () => {
    const { response } = suiteData as EndpointSuiteData;
    expect(typeof response.body.data === dataType).toBeTruthy();
  });
}
