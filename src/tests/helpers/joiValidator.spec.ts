import Joi from 'joi';
import { ValidationError, joiValidator } from '../../helpers';

describe('-Test joiValidator helper:-', () => {
  describe('--Function: joiValidator(schema,data):-', () => {
    const testSchema = Joi.string().valid('Valid value');

    it('--Should be validate data and return it without errors', async () => {
      await expectAsync(joiValidator(testSchema, 'Valid value')).toBeResolvedTo(
        'Valid value'
      );
    });

    it('--Should be rejected with ValidationError.', async () => {
      await expectAsync(
        joiValidator(testSchema, 'InValid value')
      ).toBeRejectedWithError(ValidationError);
    });
  });
});
