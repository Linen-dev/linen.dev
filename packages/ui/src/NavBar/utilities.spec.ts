import { sortByChannelName } from './utilities';
import { channels } from '@linen/database';

describe('sortByChannelName', () => {
  it('sorts channels by name', () => {
    const channels = [
      { channelName: 'general' },
      { channelName: 'alpha' },
    ] as channels[];
    expect(sortByChannelName(channels)).toEqual([
      { channelName: 'alpha' },
      { channelName: 'general' },
    ]);
  });
});
