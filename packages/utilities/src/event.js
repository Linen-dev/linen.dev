const EventEmitter = {
  emit(name, data) {
    this.setup();
    if (!window.LINEN_EVENT_HANDLERS[name]) {
      return;
    }
    window.LINEN_EVENT_HANDLERS[name].forEach((callback) => callback(data));
  },
  on(name, callback) {
    this.setup();
    if (!window.LINEN_EVENT_HANDLERS[name]) {
      window.LINEN_EVENT_HANDLERS[name] = [];
    }
    window.LINEN_EVENT_HANDLERS[name].push(callback);
  },
  off(name, callback) {
    this.setup();
    if (!window.LINEN_EVENT_HANDLERS[name]) {
      return;
    }
    window.LINEN_EVENT_HANDLERS[name] = window.LINEN_EVENT_HANDLERS[
      name
    ].filter((handler) => handler !== callback);
  },
  setup() {
    window.LINEN_EVENT_HANDLERS = window.LINEN_EVENT_HANDLERS || {};
  },
};

export default EventEmitter;
