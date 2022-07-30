import '@testing-library/jest-dom/extend-expect';
import { TextEncoder, TextDecoder } from 'util';

window.fetch = jest.fn().mockResolvedValue({});
global.setImmediate = jest.useRealTimers;

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;
