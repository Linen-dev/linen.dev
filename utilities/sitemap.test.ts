import { createXMLSitemap, createXMLSitemapForSubdomain } from './sitemap';

describe('#createXMLSitemap', () => {
  it('creates a sitemap index', async () => {
    const sitemap = await createXMLSitemap();
    expect(sitemap).toContain('<sitemapindex ');
  });
});
