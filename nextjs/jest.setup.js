import '@testing-library/jest-dom/extend-expect';

window.fetch = jest.fn().mockResolvedValue({});
global.setImmediate = jest.useRealTimers;
