import { sortByChannelName } from './utilities';

describe('sortByChannelName', () => {
  it('sorts channels by name', () => {
    const channels = [
      { channelName: 'general' },
      { channelName: 'alpha' },
    ] as any[];
    expect(sortByChannelName(channels)).toEqual([
      { channelName: 'alpha' },
      { channelName: 'general' },
    ]);
  });
});
