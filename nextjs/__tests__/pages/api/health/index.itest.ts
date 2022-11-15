import { index } from 'pages/api/health';
import setup from '__tests__/spec-helpers/integration';

setup({ truncationStrategy: 'delete' });

describe('#index', () => {
  it('returns a 200 status code', async () => {
    const { status } = await index();
    expect(status).toEqual(200);
  });
});
