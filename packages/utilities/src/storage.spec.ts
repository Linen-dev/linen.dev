import { localStorage, sessionStorage } from './storage';

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
