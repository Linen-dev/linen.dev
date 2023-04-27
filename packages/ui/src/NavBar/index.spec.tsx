import React from 'react';
import NavBar from '.';
import { render } from '@testing-library/react';
import { build } from '@linen/factory';
import { Mode } from '@linen/hooks/mode';

describe('NavBar', () => {
  it.skip('renders channels', () => {
    const channel1 = build('channel');
    const channel2 = build('channel');
    const channels = [channel1, channel2];
    const { container } = render(
      <NavBar
        channelName={channel1.channelName}
        channels={channels}
        communities={[]}
        permissions={build('permissions')}
        mode={Mode.Default}
        dms={[]}
        {...{
          archiveChannel: jest.fn(),
          getHomeUrl: jest.fn(),
          Image: jest.fn(),
          Link: jest.fn(),
          NewChannelModal: jest.fn(),
          NewCommunityModal: jest.fn(),
          NewDmModal: jest.fn(),
          notify: jest.fn(),
          post: jest.fn(),
          put: jest.fn(),
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
