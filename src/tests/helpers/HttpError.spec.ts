import { HttpError } from '../../helpers';

describe('-Test HttpError helper:-', () => {
  describe('--Class: HttpError(400,msg):-', () => {
    const errorWithStandardHttpMsg = new HttpError(404),
      errorWithCustomHttpMsg = new HttpError(404, 'Custom Error');

    it('--Create custom errors to serve http errors with standard message.', async () => {
      expect(errorWithStandardHttpMsg).toBeInstanceOf(Error);
      expect(errorWithStandardHttpMsg.message).toEqual('Not Found');
      expect(errorWithStandardHttpMsg.statusCode).toEqual(404);
    });

    it('--Create custom errors to serve http errors with custom message.', async () => {
      expect(errorWithCustomHttpMsg).toBeInstanceOf(Error);
      expect(errorWithCustomHttpMsg.message).toEqual('Custom Error');
      expect(errorWithCustomHttpMsg.statusCode).toEqual(404);
    });
  });
});
