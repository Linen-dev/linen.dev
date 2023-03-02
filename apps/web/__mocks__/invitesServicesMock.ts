import * as invitesServices from 'services/invites';

jest.mock('services/invites', () => ({
  __esModule: true,
  ...jest.requireActual('services/invites'),
}));

export { invitesServices };
