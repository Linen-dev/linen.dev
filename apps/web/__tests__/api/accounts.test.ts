import './server';
import request from 'supertest';
import app from 'api/routes/accounts';
import { create } from '__tests__/factory';
import { accounts } from '@prisma/client';
import { v4 } from 'uuid';

describe('GET /api/v2/accounts', function () {
  let mockAccount: accounts;
  beforeAll(async () => {
    mockAccount = await create('account', { slackDomain: v4() });
  });
  it('it should get 400 due missing params', async function () {
    const response = await request(app)
      .get('/accounts')
      .set('Accept', 'application/json');

    expect(response.status).toEqual(400);
  });

  it('it should get 404', async function () {
    const response = await request(app)
      .get('/accounts?communityName=NoExists')
      .set('Accept', 'application/json');

    expect(response.status).toEqual(404);
  });

  it('should get account settings', async function () {
    const response = await request(app)
      .get(`/accounts?communityName=${mockAccount.slackDomain}`)
      .set('Accept', 'application/json');

    expect(response.status).toEqual(200);
    expect(response.body.communityId).toEqual(mockAccount.id);
    expect(response.body.communityName).toEqual(mockAccount.slackDomain);
  });
});
