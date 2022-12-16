const storage = {
  get (key: string) {
    try {
      return window.localStorage.getItem(key)
    } catch (exception) {
      return null
    }
  },
  set (key: string, value: string) {
    try {
      return window.localStorage.setItem(key, value)
    } catch (exception) {
      return null
    }
  }
}

export default storage
