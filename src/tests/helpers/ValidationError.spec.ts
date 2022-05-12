import { HttpError, ValidationError } from '../../helpers';

describe('-Test ValidationError helper:-', () => {
  describe('--Class: ValidationError(status,msg):-', () => {
    const validationRes = {
        field: 'Error msg',
      },
      instanceError = new ValidationError('Error msg', validationRes),
      httpInstanceError = instanceError.getHttpError(400);

    it('--Create custom errors to serve validations errors.', async () => {
      expect(instanceError).toBeInstanceOf(Error);
      expect(instanceError.message).toEqual('Error msg');
      expect(instanceError.validationResult).toEqual(validationRes);
    });

    it('--ValidationError.getHttpError(status,httpMsg) should be get http error from instance.', async () => {
      expect(httpInstanceError).toBeInstanceOf(HttpError);
      expect(httpInstanceError.message).toEqual('Error msg');
      expect(httpInstanceError.statusCode).toEqual(400);
    });
  });
});
