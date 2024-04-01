import transform from './transform';

describe('transform', () => {
  it('transforms code tokens to pre tokens if they contain newlines', () => {
    const tree = {
      type: 'root',
      children: [
        {
          type: 'code',
          value: 'foo\nbar',
          source: 'foo\nbar',
        },
      ],
      source: 'foo\nbar',
    };
    const output = transform(tree);

    expect(output).toEqual(
      expect.objectContaining({
        type: 'root',
        children: [
          expect.objectContaining({
            type: 'pre',
            value: 'foo\nbar',
            source: 'foo\nbar',
          }),
        ],
        source: 'foo\nbar',
      })
    );
  });

  it('converts json like messages to code blocks', () => {
    const tree = {
      type: 'root',
      children: [
        {
          type: 'text',
          value: '{ "foo": "bar" }',
          source: '{ "foo": "bar" }',
        },
      ],
      source: '{ "foo": "bar" }',
    };

    const output = transform(tree);

    expect(output).toEqual(
      expect.objectContaining({
        type: 'root',
        children: [
          expect.objectContaining({
            type: 'pre',
            value: '{ "foo": "bar" }',
            source: '{ "foo": "bar" }',
          }),
        ],
        source: '{ "foo": "bar" }',
      })
    );
  });

  it('converts html templates to code blocks', () => {
    const tree = {
      type: 'root',
      children: [
        {
          type: 'text',
          value: '<!DOCTYPE html><html><body><h1>Hello, world!</body></html>',
          source: '<!DOCTYPE html><html><body><h1>Hello, world!</body></html>',
        },
      ],
      source: '<!DOCTYPE html><html><body><h1>Hello, world!</body></html>',
    };

    const output = transform(tree);

    expect(output).toEqual(
      expect.objectContaining({
        type: 'root',
        children: [
          expect.objectContaining({
            type: 'pre',
            value: '<!DOCTYPE html><html><body><h1>Hello, world!</body></html>',
            source:
              '<!DOCTYPE html><html><body><h1>Hello, world!</body></html>',
          }),
        ],
        source: '<!DOCTYPE html><html><body><h1>Hello, world!</body></html>',
      })
    );
  });
});
