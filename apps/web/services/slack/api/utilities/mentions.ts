// to get best matching format
// it would be better to parse the message and
// stringify it to the slack format
// we don't have a slack stringifier yet due to time constraints
// so let's make a naive id replace

export function replaceMentionsWithDisplayName(text: string, mentions: any[]) {
  if (!mentions || mentions.length === 0) {
    return text;
  }
  let body = text;
  mentions.forEach((mention) => {
    if (mention.users.displayName) {
      body = body.replace(
        new RegExp(`@${mention.usersId}`, 'g'),
        mention.users.displayName
      );
    }
  });
  return body;
}
