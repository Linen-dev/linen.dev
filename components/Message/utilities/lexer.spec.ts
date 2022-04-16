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

      describe('when backticks are used within the user name', () => {
        it('does not return a code token', () => {
          const input = '<@`user`>';
          const expected = [{ type: TokenType.Mention, value: '`user`' }];
          expect(tokenize(input)).toEqual(expected);
        });
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
        const expected = [{ type: TokenType.BasicChannel, value: 'channel' }];
        expect(tokenize(input)).toEqual(expected);
      });

      describe('when backticks are used within the user name', () => {
        it('does not return a code token', () => {
          const input = '<!`channel`>';
          const expected = [
            { type: TokenType.BasicChannel, value: '`channel`' },
          ];
          expect(tokenize(input)).toEqual(expected);
        });
      });
    });

    describe('when the channel is invalid', () => {
      it('returns an empty channel token', () => {
        const input = '<!>';
        const expected = [{ type: TokenType.BasicChannel, value: '' }];
        expect(tokenize(input)).toEqual(expected);
      });
    });
  });

  describe('when channel name is present', () => {
    describe('when the channel name is valid', () => {
      it('returns a channel token', () => {
        const input = '<#A1|foo>';
        const expected = [{ type: TokenType.ComplexChannel, value: 'A1|foo' }];
        expect(tokenize(input)).toEqual(expected);
      });

      describe('when backticks are used within the user name', () => {
        it('does not return a code token', () => {
          const input = '<#`A1`|`foo`>';
          const expected = [
            { type: TokenType.ComplexChannel, value: '`A1`|`foo`' },
          ];
          expect(tokenize(input)).toEqual(expected);
        });
      });
    });

    describe('when the channel is invalid', () => {
      it('returns an empty channel token', () => {
        const input = '<#>';
        const expected = [{ type: TokenType.ComplexChannel, value: '' }];
        expect(tokenize(input)).toEqual(expected);
      });
    });
  });

  describe('when code is present', () => {
    describe('when it uses a single backtick', () => {
      it('returns a code token', () => {
        const input = '`foo`';
        const expected = [{ type: TokenType.Code, value: 'foo' }];
        expect(tokenize(input)).toEqual(expected);
      });
    });

    describe('when there are two single backticks', () => {
      it('returns two code tokens', () => {
        const input = '`foo` `bar`';
        const expected = [
          { type: TokenType.Code, value: 'foo' },
          { type: TokenType.Text, value: ' ' },
          { type: TokenType.Code, value: 'bar' },
        ];
        expect(tokenize(input)).toEqual(expected);
      });
    });

    describe('when there are three backticks', () => {
      it('returns a code token', () => {
        const input = '```foo```';
        const expected = [{ type: TokenType.Code, value: 'foo' }];
        expect(tokenize(input)).toEqual(expected);
      });
    });

    describe('when there are two three backticks', () => {
      it('returns a code token', () => {
        const input = '```foo``` ```bar```';
        const expected = [
          { type: TokenType.Code, value: 'foo' },
          { type: TokenType.Text, value: ' ' },
          { type: TokenType.Code, value: 'bar' },
        ];
        expect(tokenize(input)).toEqual(expected);
      });
    });
  });
});
