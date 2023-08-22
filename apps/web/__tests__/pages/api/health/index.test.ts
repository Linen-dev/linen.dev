import { index } from 'pages/api/health';

describe('#index', () => {
  it('returns a 200 status code', async () => {
    const { status } = await index();
    expect(status).toEqual(200);
  });
});
