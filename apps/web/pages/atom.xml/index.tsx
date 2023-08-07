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
    <feed xmlns="http://www.w3.org/2005/Atom">
      <title>Linen Feed</title>
      <link href="https://www.linen.dev" />
      <subtitle>Search-engine friendly community platform.</subtitle>
    
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
        <entry>
          <title>${encode(title)}</title>
          <link href="${encode(url)}" />
          <summary>${encode(description)}</summary>
          <id>${thread.id}</id>
          <published>${new Date(
            Number(thread.lastReplyAt)
          ).toISOString()}</published>
        </entry>
        `;
      })}
    
    </feed>`);
    res.end();
  }
  return {
    props: {},
  };
};

export default RSSFeed;
