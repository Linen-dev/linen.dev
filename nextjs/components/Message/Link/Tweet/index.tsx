import React from 'react';
import { TwitterTweetEmbed } from 'react-twitter-embed';
import { getTweetId } from './utilities';
import styles from './index.module.css';

interface Props {
  src: string;
}

function Tweet({ src }: Props) {
  const tweetId = getTweetId(src);
  return (
    <div className={styles.tweet}>
      <TwitterTweetEmbed tweetId={tweetId} />
    </div>
  );
}

export default Tweet;
