import type { Settings } from 'serializers/account/settings';
import { getThreadUrl } from './url';

describe('#getThreadUrl', () => {
  it('returns the url of a thread', () => {
    const url = getThreadUrl({
      isSubDomainRouting: false,
      settings: { communityName: 'linen', prefix: 's' } as Settings,
      slug: 'test',
      incrementId: 1,
    });
    expect(url).toBe('https://linen.dev/s/linen/t/1/test');
  });
});
