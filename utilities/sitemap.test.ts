import { createXMLSitemap, createXMLSitemapForSubdomain } from './sitemap';

describe('#createXMLSitemap', () => {
  it('creates a sitemap index', async () => {
    const sitemap = await createXMLSitemap('linendev.com');
    expect(sitemap).toContain('<sitemapindex ');
    expect(sitemap).toContain('linendev.com');
  });
});
