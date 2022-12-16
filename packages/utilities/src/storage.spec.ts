import storage from './storage'

describe('#storage', () => {
  it('exposes set and get methods', () => {
    expect(typeof storage.get).toEqual('function')
    expect(typeof storage.set).toEqual('function')
  })
})
