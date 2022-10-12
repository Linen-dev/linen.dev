import React from 'react';
import NavBar from '.';
import { render } from '@testing-library/react';
import { create as factory } from '__tests__/factory';

describe('NavBar', () => {
  it('renders channels', () => {
    const channel1 = factory('channel');
    const channel2 = factory('channel');
    const channels = [channel1, channel2];
    const { container } = render(
      <NavBar
        channelName={channel1.channelName}
        channels={channels}
        permissions={factory('permissions')}
        token={null}
      />
    );
    expect(container).toHaveTextContent(channel1.channelName);
    expect(container).toHaveTextContent(channel2.channelName);
  });
});
