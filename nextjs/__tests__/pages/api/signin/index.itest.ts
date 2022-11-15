import { create } from 'pages/api/signin';

describe('#create', () => {
  it('returns a 200 status code', async () => {
    const { status } = await create();
    expect(status).toEqual(200);
  });
});
