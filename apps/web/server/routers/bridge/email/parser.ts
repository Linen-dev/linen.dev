const emailRegex =
  /(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))/g;

export const extractEmail = (text: string) => text.match(emailRegex);

const quotedRegex = /\n*On.*<?\n?.*>?.*\n?wrote:\n?/;

export function cleanUpQuotedEmail(text: string) {
  const quoted = text.match(quotedRegex);
  if (!quoted || !quoted.length) return text;
  const splitBy = quoted.shift();
  if (!splitBy) return text;
  return text.split(splitBy).shift()?.trim() || text;
}
