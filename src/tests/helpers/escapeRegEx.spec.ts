import { escapeRegEx } from '../../helpers';

describe('-Test escapeRegEx helper:-', () => {
  describe('--Function: escapeRegEx(str):-', () => {
    const regexCharacters = '[]()^$',
      escapedRegexCharacters = '\\[\\]\\(\\)\\^\\$';

    it('--Should be return escaped regex characters.', async () => {
      expect(escapeRegEx(regexCharacters)).toEqual(escapedRegexCharacters);
    });
  });
});
