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
}

export const localStorage = new Storage('local');
export const sessionStorage = new Storage('session');
