const observe = jest.fn();
const unobserve = jest.fn();
const disconnect = jest.fn();

window.IntersectionObserver = jest.fn(() => ({
  observe,
  unobserve,
  disconnect,
}));
