import React from 'react';
import NavBar from '.';
import { render } from '@testing-library/react';
import { create as factory } from '__tests__/factory';
import { SessionProvider } from 'next-auth/react';

describe('NavBar', () => {
  it('renders channels', () => {
    const channels = [
      factory('channel', {
        channelName: 'channel1',
      }),
      factory('channel', {
        channelName: 'channel2',
      }),
    ];
    const { getByText } = render(
      <SessionProvider>
        <NavBar
          channelName={channels[0].channelName}
          channels={channels}
          communityName="Linen"
          communityType="slack"
          isSubDomainRouting={false}
          permissions={factory('permissions')}
        />
      </SessionProvider>
    );
    expect(getByText('channel1')).toBeInTheDocument();
    expect(getByText('channel2')).toBeInTheDocument();
  });
});
