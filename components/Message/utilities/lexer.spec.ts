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

  describe('when a basic channel is present', () => {
    describe('when the basic channel is valid', () => {
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

    describe('when the basic channel is invalid', () => {
      it('returns an empty channel token', () => {
        const input = '<!>';
        const expected = [{ type: TokenType.BasicChannel, value: '' }];
        expect(tokenize(input)).toEqual(expected);
      });
    });
  });

  describe('when a complex channel is present', () => {
    describe('when the complex channel is valid', () => {
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

    describe('when the complex channel is invalid', () => {
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

      describe('when a single backtick does not have a closing backtick', () => {
        it('returns a code token', () => {
          const input = '`foo';
          const expected = [{ type: TokenType.Code, value: 'foo' }];
          expect(tokenize(input)).toEqual(expected);
        });
      });

      describe('when a single backtick contains html code', () => {
        it('returns a code token', () => {
          const input = '`<strong>foo</strong>`';
          const expected = [
            { type: TokenType.Code, value: '<strong>foo</strong>' },
          ];
          expect(tokenize(input)).toEqual(expected);
        });
      });

      describe('when a single backtick contains js code', () => {
        it('returns a code token', () => {
          const input = '`const foo = "bar";`';
          const expected = [
            { type: TokenType.Code, value: 'const foo = "bar";' },
          ];
          expect(tokenize(input)).toEqual(expected);
        });
      });

      describe('when a single backtick contains css code', () => {
        it('returns a code token', () => {
          const input = '`.foo { color: red; }`';
          const expected = [
            { type: TokenType.Code, value: '.foo { color: red; }' },
          ];
          expect(tokenize(input)).toEqual(expected);
        });
      });

      describe('when a single backtick contains a mention tag', () => {
        it('returns a code token', () => {
          const input = '`foo <@foo>`';
          const expected = [{ type: TokenType.Code, value: 'foo <@foo>' }];
          expect(tokenize(input)).toEqual(expected);
        });
      });

      describe('when a single backtick contains a mention tag', () => {
        it('returns a code token', () => {
          const input = '`foo <@foo>`';
          const expected = [{ type: TokenType.Code, value: 'foo <@foo>' }];
          expect(tokenize(input)).toEqual(expected);
        });
      });

      describe('when a single backtick contains a basic channel tag', () => {
        it('returns a code token', () => {
          const input = '`foo <#foo>`';
          const expected = [{ type: TokenType.Code, value: 'foo <#foo>' }];
          expect(tokenize(input)).toEqual(expected);
        });
      });

      describe('when a single backtick contains a complex channel tag', () => {
        it('returns a code token', () => {
          const input = '`foo <!foo|bar>`';
          const expected = [{ type: TokenType.Code, value: 'foo <!foo|bar>' }];
          expect(tokenize(input)).toEqual(expected);
        });
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
