import { parseDiscordSentAt, parseSlackSentAt } from './sentAt';

describe('#sentAt parser', () => {
  it('parseDiscordSentAt', () => {
    const result = parseDiscordSentAt('2022-05-23T22:32:39.443000+00:00');
    expect(result).toEqual(1653345159443);
  });
  it('parseSlackSentAt', () => {
    const result = parseSlackSentAt('1648300889.927679');
    expect(result).toEqual(1648300889927);
  });
});
