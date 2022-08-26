import { getThreadUrl } from './url';

describe('#getThreadUrl', () => {
  it('returns the url of a thread', () => {
    const url = getThreadUrl({
      isSubDomainRouting: false,
      communityName: 'linen',
      communityType: 'slack',
      slug: 'test',
      incrementId: 1,
    });
    expect(url).toBe('http://localhost/s/linen/t/1/test');
  });
});
