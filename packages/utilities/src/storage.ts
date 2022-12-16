const storage = {
  get (key: string) {
    try {
      return window.localStorage.getItem(key)
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
