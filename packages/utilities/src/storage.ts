const storage = {
  get (key: string) {
    try {
      const value = window.localStorage.getItem(key)
      if (value && value.startsWith('{') && value?.endsWith('}')) {
        return JSON.parse(value)
      }
      return value
    } catch (exception) {
      return null
    }
  },
  set (key: string, input: string | object) {
    try {
      const value = typeof input === 'object' ? JSON.stringify(input) : input
      return window.localStorage.setItem(key, value)
    } catch (exception) {
      return null
    }
  }
}

export default storage
