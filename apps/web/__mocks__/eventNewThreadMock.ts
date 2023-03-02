import * as eventNewThread from 'services/events/eventNewThread';

jest.mock('services/events/eventNewThread', () => ({
  __esModule: true,
  ...jest.requireActual('services/events/eventNewThread'),
}));

export { eventNewThread };
