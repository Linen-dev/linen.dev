import { Text } from '@mantine/core';
import { useMemo } from 'react';
import MessageRangeText from './MessageRangeText';

function Message({ text, truncate, users }) {
  const textToRender = useMemo(() => {
    let str = text;
    if (truncate) {
      const excerpt = str.substr(0, 220);
      str = `${excerpt}${excerpt.length === 220 ? '...' : ''}`;
    }
    // Replace @mentions
    str = str.replace(/<@(.*?)>/, (replacedStr, userId) => {
      const userDisplayName =
        users.find((u) => u.slackUserId === userId)?.displayName || 'User';
      return `<b>@${userDisplayName}</b>`;
    });
    // Replace channel names
    str = str.replace(
      /<#(.*?)\|(.*?)>/,
      (replacedStr, channelId, channelName) => {
        return `<b>#${channelName}</b>`;
      }
    );
    // Replace links
    str = str.replace(/<http(.*?)>/, (replacedStr, urlWithPotentialText) => {
      const initialUrl = `http${urlWithPotentialText}`;
      let url = initialUrl;
      let text = initialUrl;
      if (initialUrl.includes('|')) {
        url = initialUrl.split('|')[0];
        text = initialUrl.split('|')[1];
      }
      return `<link href=${url}>${text}</link>`;
    });
    return str;
  }, [text, truncate, users]);

  return (
    <MessageRangeText text={textToRender} boldIndicator={/<b>(.*)?<\/b>/} />
  );
}

export default Message;
