import { tokenize, TokenType } from './lexer';

describe('#tokenize', () => {
  it('returns an array of tokens', () => {
    const input = 'Hello, world!';
    const expected = [{ type: TokenType.Text, value: 'Hello, world!' }];
    expect(tokenize(input)).toEqual(expected);
  });

  describe('when mention is present', () => {
    describe('when the mention is valid', () => {
      it('returns a mention token', () => {
        const input = '<@user>';
        const expected = [{ type: TokenType.Mention, value: 'user' }];
        expect(tokenize(input)).toEqual(expected);
      });
    });

    describe('when the mention is invalid', () => {
      it('returns an empty mention token', () => {
        const input = '<@>';
        const expected = [{ type: TokenType.Mention, value: '' }];
        expect(tokenize(input)).toEqual(expected);
      });
    });
  });

  describe('when channel is present', () => {
    describe('when the channel is valid', () => {
      it('returns a channel token', () => {
        const input = '<!channel>';
        const expected = [{ type: TokenType.Channel, value: 'channel' }];
        expect(tokenize(input)).toEqual(expected);
      });
    });

    describe('when the channel is invalid', () => {
      it('returns an empty channel token', () => {
        const input = '<!>';
        const expected = [{ type: TokenType.Channel, value: '' }];
        expect(tokenize(input)).toEqual(expected);
      });
    });
  });
});
