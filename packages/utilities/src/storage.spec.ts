import { localStorage, sessionStorage, memoryStorage } from './storage';

describe('#localStorage', () => {
  it('exposes set and get methods', () => {
    expect(typeof localStorage.get).toEqual('function');
    expect(typeof localStorage.set).toEqual('function');
  });
});

describe('#sessionStorage', () => {
  it('exposes set and get methods', () => {
    expect(typeof sessionStorage.get).toEqual('function');
    expect(typeof sessionStorage.set).toEqual('function');
  });
});

describe('#memoryStorage', () => {
  it('exposes set and get methods', () => {
    expect(typeof memoryStorage.get).toEqual('function');
    expect(typeof memoryStorage.set).toEqual('function');
  });

  it('sets and gets data', () => {
    memoryStorage.set('foo', 'bar');
    expect(memoryStorage.get('foo')).toEqual('bar');
    memoryStorage.set('foo', 'baz');
    expect(memoryStorage.get('foo')).toEqual('baz');
    memoryStorage.remove('foo');
    expect(memoryStorage.get('foo')).toEqual(undefined);
  });
});
