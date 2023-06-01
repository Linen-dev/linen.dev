type StorageType = 'local' | 'session';

class Storage {
  type: StorageType;

  constructor(type: StorageType) {
    this.type = type;
  }

  get(key: string) {
    try {
      const value = window[`${this.type}Storage`].getItem(key);
      if (value && value.startsWith('{') && value?.endsWith('}')) {
        return JSON.parse(value);
      }
      return value;
    } catch (exception) {
      return null;
    }
  }

  set(key: string, input: string | object) {
    try {
      const value = typeof input === 'object' ? JSON.stringify(input) : input;
      return window[`${this.type}Storage`].setItem(key, value);
    } catch (exception) {
      return null;
    }
  }

  remove(key: string) {
    try {
      window[`${this.type}Storage`].removeItem(key);
    } catch (exception) {}
  }
}
class MemoryStorage {
  cache: any;

  constructor() {
    this.cache = {};
  }

  get(key: string) {
    return this.cache[key];
  }
  set(key: string, input: string | object) {
    this.cache[key] = input;
    return input;
  }
  remove(key: string) {
    delete this.cache[key];
  }
}

export const localStorage = new Storage('local');
export const sessionStorage = new Storage('session');
export const memoryStorage = new MemoryStorage();
