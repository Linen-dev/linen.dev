const EventEmitter = {
  events: {},
  emit(name, data) {
    if (!this.events[name]) {
      return;
    }
    this.events[name].forEach((callback) => callback(data));
  },
  on(name, callback) {
    if (!this.events[name]) {
      this.events[name] = [];
    }
    this.events[name].push(callback);
  },
  off(name, callback) {
    if (!this.events[name]) {
      return;
    }
    this.events[name] = this.events[name].filter(
      (handler) => handler !== callback
    );
  },
};

export default EventEmitter;
