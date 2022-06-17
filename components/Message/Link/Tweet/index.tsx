import React from 'react';
import { TwitterTweetEmbed } from 'react-twitter-embed';

interface Props {
  tweetId: string;
}

function Tweet({ tweetId }: Props) {
  return <TwitterTweetEmbed tweetId={tweetId} />;
}

export default Tweet;
