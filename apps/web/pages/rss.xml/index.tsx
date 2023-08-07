import React from 'react';
import { GetServerSideProps } from 'next';
import { SerializedThread, Settings } from '@linen/types';
import { buildThreadSeo } from 'utilities/seo';
import { encode } from 'html-entities';

const RSSFeed: React.FC = () => null;

const FEED_PRODUCTION_URL = 'https://static.main.linendev.com/api/feed';
const FEED_DEVELOPMENT_URL = 'http://localhost:3000/api/feed';

const FEED_URL =
  process.env.NODE_ENV === 'production'
    ? FEED_PRODUCTION_URL
    : FEED_DEVELOPMENT_URL;

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  if (res) {
    const response = await fetch(FEED_URL, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    const data = await response.json();
    const { threads, settings } = data;
    res.setHeader('Content-Type', 'text/xml');
    res.write(`<?xml version="1.0" encoding="UTF-8" ?>
    <rss version="2.0">
    
    <channel>
      <title>Linen Feed</title>
      <link>https://www.linen.dev</link>
      <description>Search-engine friendly community platform.</description>
      ${threads.map((thread: SerializedThread) => {
        const setting = settings.find(
          (setting: Settings) =>
            setting.communityId === thread.channel?.accountId
        ) as Settings;
        const { title, description, url } = buildThreadSeo({
          isSubDomainRouting: false,
          channelName: thread.channel?.channelName as string,
          settings: setting,
          thread,
        });
        return `
        <item>
          <title>${encode(title)}</title>
          <link>${encode(url)}</link>
          <description>${encode(description)}</description>
          <pubDate>${new Date(Number(thread.lastReplyAt))}</pubDate>
        </item>
        `;
      })}
    </channel>
    
    </rss>`);
    res.end();
  }
  return {
    props: {},
  };
};

export default RSSFeed;
