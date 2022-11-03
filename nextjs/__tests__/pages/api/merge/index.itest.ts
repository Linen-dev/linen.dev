import { create } from 'pages/api/merge';

describe('create', () => {
  it('returns 400 if from param is empty', async () => {
    const { status } = await create({ from: '', to: '1', communityId: '1' });
    expect(status).toEqual(400);
  });

  it('returns 400 if to param is empty', async () => {
    const { status } = await create({ from: '1', to: '', communityId: '1' });
    expect(status).toEqual(400);
  });

  it('returns 404 for an unknown community', async () => {
    const { status } = await create({ from: '1', to: '1', communityId: '1' });
    expect(status).toEqual(404);
  });
});
