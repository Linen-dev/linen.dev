import { useMemo } from 'react';
import MessageRangeText from './MessageRangeText';
import { users } from '@prisma/client';

function Message({
  text,
  truncate,
  author,
  mentions,
}: {
  text: string;
  truncate?: any;
  author: users;
  mentions: users[];
}) {
  const textToRender = useMemo(() => {
    let str = text;
    if (truncate) {
      const excerpt = str.substr(0, 220);
      str = `${excerpt}${excerpt.length === 220 ? '...' : ''}`;
    }
    // Replace @mentions
    str = str.replace(/<@(.*?)>/g, (replacedStr, userId) => {
      const mention = mentions.find((m) => m.slackUserId === userId);
      const userDisplayName = mention?.displayName || 'User';
      return `<b>@${userDisplayName}</b>`;
    });
    // Replace @channel, @here
    str = str.replace(/<!(.*?)>/g, (replacedStr, innerTag) => {
      return `<b>@${innerTag}</b>`;
    });
    // Replace channel names
    str = str.replace(
      /<#(.*?)\|(.*?)>/g,
      (replacedStr, channelId, channelName) => {
        return `<b>#${channelName}</b>`;
      }
    );
    // Replace links
    str = str.replace(/<http(.*?)>/g, (replacedStr, urlWithPotentialText) => {
      const initialUrl = `http${urlWithPotentialText}`;
      let url = initialUrl;
      let text = initialUrl;
      if (initialUrl.includes('|')) {
        url = initialUrl.split('|')[0];
        text = initialUrl.split('|')[1];
      }
      return `<link href=${url}>${text}</link>`;
    });

    // Code block didn't work because it wasn't accounting for new lines
    // Replace codeblocks
    // str = str.replace(/```((.|\n)*)```/g, (replacedStr, code) => {
    //   console.log({ replacedStr });
    //   return `<code>${code}</code>`;
    // });

    // Replace inline codeblocks after others are gone
    // str = str.replace(/`(.*?)`/g, (replacedStr, code) => {
    //   return `<code>${code}</code>`;
    // });
    // Hack to replace at least these entities
    str = str.replace(/&gt;/g, '>');
    str = str.replace(/&lt;/g, '<');
    return str;
  }, [text, truncate]);

  return (
    <div className="text-sm">
      <MessageRangeText text={textToRender} />
    </div>
  );
}

export default Message;
