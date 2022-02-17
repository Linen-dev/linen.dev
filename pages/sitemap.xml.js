import React from 'react';
import { channelIndex, threadIndex } from '../lib/slack';
import { accountId } from '../constants/examples';

const Sitemap = () => {};

export const getServerSideProps = async ({ res }) => {
  const baseUrl = {
    development: 'http://localhost:3000',
    // production: "https://mydomain.com",
  }[process.env.NODE_ENV];

  // const staticPages = fs
  //   .readdirSync('pages')
  //   .filter((staticPage) => {
  //     return ![
  //       '_app.js',
  //       '_document.js',
  //       '_error.js',
  //       'sitemap.xml.js',
  //     ].includes(staticPage);
  //   })
  //   .map((staticPagePath) => {
  //     return `${baseUrl}/${staticPagePath}`;
  //   });

  const staticPages = [];

  const channels = await channelIndex(accountId);
  const channelsWithThreads = await Promise.all(
    channels.map(async (c) => {
      const threads = await threadIndex(c.id, 100);
      return { ...c, threads };
    })
  );
  const allThreads = channelsWithThreads.reduce((agg, channel) => {
    return agg.concat(channel.threads);
  }, []);

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      ${staticPages
        .map((url) => {
          return `
            <url>
              <loc>${url}</loc>
              <lastmod>${new Date().toISOString()}</lastmod>
              <changefreq>weekly</changefreq>
              <priority>1.0</priority>
            </url>
          `;
        })
        .join('')}
      ${channels
        .map(({ id, updatedAt }) => {
          return `
              <url>
                <loc>${baseUrl}/channel/${id}</loc>
                <lastmod>${new Date().toISOString()}</lastmod>
                <changefreq>weekly</changefreq>
                <priority>1.0</priority>
              </url>
            `;
        })
        .join('')}
      ${allThreads
        .map(({ id, channelId, messages }) => {
          return `
              <url>
                <loc>${baseUrl}/channel/${channelId}/thread/${id}</loc>
                <lastmod>${new Date(messages[0].sentAt).toISOString()}</lastmod>
                <changefreq>monthly</changefreq>
                <priority>1.0</priority>
              </url>
            `;
        })
        .join('')}
    </urlset>
  `;

  res.setHeader('Content-Type', 'text/xml');
  res.write(sitemap);
  res.end();

  return {
    props: {},
  };
};

export default Sitemap;
