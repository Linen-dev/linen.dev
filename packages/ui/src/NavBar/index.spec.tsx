import React from 'react';
import NavBar from '.';
import { render } from '@testing-library/react';
import { build } from '@linen/factory';
import { Mode } from '@linen/hooks/mode';
import type { ApiClient } from '@linen/api-client';

describe('NavBar', () => {
  it.skip('renders channels', () => {
    const community = build('account');
    const channel1 = build('channel');
    const channel2 = build('channel');
    const channels = [channel1, channel2];
    const { container } = render(
      <NavBar
        channelName={channel1.channelName}
        currentCommunity={community}
        channels={channels}
        communities={[]}
        permissions={build('permissions')}
        mode={Mode.Default}
        dms={[]}
        api={{} as ApiClient}
        {...{
          archiveChannel: jest.fn(),
          getHomeUrl: jest.fn(),
          Link: jest.fn(),
          NewChannelModal: jest.fn(),
          NewCommunityModal: jest.fn(),
          NewDmModal: jest.fn(),
          notify: jest.fn(),
          routerAsPath: '/',
          usePath: jest.fn(),
          onDrop: jest.fn(),
        }}
      />
    );
    expect(container).toHaveTextContent(channel1.channelName);
    expect(container).toHaveTextContent(channel2.channelName);
  });
});
