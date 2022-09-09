import { index } from 'pages/api/inbox';
import setup from '__tests__/spec-helpers/integration';

setup({ truncationStrategy: 'cascade' });

describe('inbox', () => {
  describe('#index', () => {
    it('returns threads', async () => {
      const { status, data } = await index();
      expect(status).toEqual(200);
      expect(data).toEqual({ threads: [] });
    });
  });
});
