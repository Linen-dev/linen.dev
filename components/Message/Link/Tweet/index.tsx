import React from 'react';
import { TwitterTweetEmbed } from 'react-twitter-embed';
import { getTweetId } from './utilities';

interface Props {
  src: string;
}

function Tweet({ src }: Props) {
  const tweetId = getTweetId(src);
  return <TwitterTweetEmbed tweetId={tweetId} />;
}

export default Tweet;
