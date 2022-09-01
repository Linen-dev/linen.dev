export interface SitemapXml {
  sitemapindex?: {
    sitemap?:
      | {
          loc: string;
        }[]
      | { loc: string };
  };
  urlset?: {
    url?:
      | {
          loc: string;
        }[]
      | { loc: string };
  };
}
