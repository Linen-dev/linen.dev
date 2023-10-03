const { toKeywords } = require('./typesense');

describe('#toKeywords', () => {
  it('works', () => {
    expect(toKeywords('is foo a self hosted tool?')).toEqual(
      'foo self hosted tool'
    );
    expect(toKeywords('how can I self host?')).toEqual('can self host');
    expect(toKeywords('what is the github url?')).toEqual('github url');
    expect(toKeywords('what is foo!')).toEqual('foo');
  });
});
