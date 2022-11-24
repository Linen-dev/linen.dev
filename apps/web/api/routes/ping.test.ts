import App from 'api/app';
import routes from 'api/routes';
import request from 'supertest';

const app = new App(routes).getServer();

describe('GET /api/v2/ping', function () {
  it('it should get 400 due missing params', async function () {
    const response = await request(app)
      .get('/api/v2/ping')
      .set('Accept', 'application/json');

    expect(response.status).toEqual(200);
    expect(response.body.pong).toEqual(true);
  });
});
