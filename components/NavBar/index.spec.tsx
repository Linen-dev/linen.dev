import React from 'react';
import NavBar from '.';
import { render } from '@testing-library/react';

describe('NavBar', () => {
  it('renders channels', () => {
    const channels = [
      {
        id: '1',
        slackChannelId: 'S01',
        channelName: 'channel1',
        channelType: 'channel',
        hidden: false,
        accountId: '1',
        slackNextPageCursor: null,
      },
      {
        id: '2',
        slackChannelId: 'S02',
        channelName: 'channel2',
        channelType: 'channel',
        hidden: false,
        accountId: '2',
        slackNextPageCursor: null,
      },
    ];
    const { getByText } = render(
      <NavBar
        channelName={channels[0].channelName}
        channels={channels}
        communityName="Linen"
        communityType="slack"
        isSubDomainRouting={false}
      />
    );
    expect(getByText('channel1')).toBeInTheDocument();
    expect(getByText('channel2')).toBeInTheDocument();
  });
});
