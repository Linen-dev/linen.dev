import { createXMLSitemap, createXMLSitemapForSubdomain } from './sitemap';

describe('#createXMLSitemap', () => {
  it('creates a sitemap index', async () => {
    const sitemap = await createXMLSitemap();
    expect(sitemap).toContain('<sitemapindex ');
  });
});

describe('#createXMLSitemapForSubdomain', () => {
  it('creates a sitemap for a subdomain', async () => {
    const sitemap = await createXMLSitemapForSubdomain('test');
    expect(sitemap).toContain(
      '<url><loc>https://test.localhost:3000/</loc></url>'
    );
  });
});
