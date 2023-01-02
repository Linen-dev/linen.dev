const parse = require('.')

describe('parse', () => {
  it('returns same tree', () => {
    const tree1 = parse.linen('https://foo.com')
    const tree2 = parse.discord('https://foo.com')

    expect(tree1).toEqual(tree2)
  })
})
