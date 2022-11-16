export function parseSlackSentAt(ts: string) {
  return new Date(parseFloat(ts) * 1000).getTime();
}

export function parseDiscordSentAt(ts: string) {
  return new Date(ts).getTime();
}

export const tsToSentAt = (ts: string) => {
  return new Date(parseFloat(ts) * 1000);
};
