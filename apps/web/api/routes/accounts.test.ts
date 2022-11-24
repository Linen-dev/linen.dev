import App from 'api/app';
import routes from 'api/routes';
import request from 'supertest';
import { create } from '__tests__/factory';
import { v4 } from 'uuid';

const app = new App(routes).getServer();

type accounts = {
  id: string;
  slackDomain: string;
};

describe('GET /api/v2/accounts', function () {
  let mockAccount: accounts;
  let mockPrivateAccount: accounts;

  beforeAll(async () => {
    mockAccount = await create('account', { slackDomain: v4() });
    mockPrivateAccount = await create('account', {
      slackDomain: v4(),
      type: 'PRIVATE',
    });
  });

  it('it should get 400 due missing params', async function () {
    const response = await request(app)
      .get('/api/v2/accounts')
      .set('Accept', 'application/json');

    expect(response.status).toEqual(400);
  });

  it('it should get 404', async function () {
    const response = await request(app)
      .get(
        '/api/v2/accounts?' + new URLSearchParams({ communityName: 'NoExists' })
      )
      .set('Accept', 'application/json');

    expect(response.status).toEqual(404);
  });

  it('should get account settings', async function () {
    const response = await request(app)
      .get(
        '/api/v2/accounts?' +
          new URLSearchParams({ communityName: mockAccount.slackDomain! })
      )
      .set('Accept', 'application/json');

    expect(response.status).toEqual(200);
    expect(response.body.communityId).toEqual(mockAccount.id);
    expect(response.body.communityName).toEqual(mockAccount.slackDomain);
  });

  it('it should get 401', async function () {
    const response = await request(app)
      .get(
        '/api/v2/accounts?' +
          new URLSearchParams({
            communityName: mockPrivateAccount.slackDomain!,
          })
      )
      .set('Accept', 'application/json');

    expect(response.status).toEqual(401);
  });
});
