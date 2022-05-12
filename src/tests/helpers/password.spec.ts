import { hashingPassword, confirmPassword } from '../../helpers';

describe('-Test password helpers:-', () => {
  const testPassword = '123456789',
    wrongPassword = '987654321';
  let testHash: string;

  describe('--Function: hashingPassword(pw):-', () => {
    it('--Should be takes password as argument and return password hash.', async () => {
      const promise = hashingPassword(testPassword);
      await expectAsync(promise).toBeResolved();
      testHash = await promise;
      expect(typeof testHash === 'string').toBeTruthy();
    });
  });

  describe('--Function: confirmPassword(pw,hash):-', () => {
    it('--The correct password must be confirmed using the correct hash.', async () => {
      const promise = confirmPassword(testPassword, testHash);
      await expectAsync(promise).toBeResolved();
      const confirmation = await promise;
      expect(confirmation).toBeTrue();
    });

    it('--Confirmation with wrong password must be refused.', async () => {
      const promise = confirmPassword(wrongPassword, testHash);
      await expectAsync(promise).toBeResolved();
      const confirmation = await promise;
      expect(confirmation).toBeFalse();
    });
  });
});
