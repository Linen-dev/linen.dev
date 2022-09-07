import React from 'react';
import { render } from '@testing-library/react';
import PageLayout from '.';
import { create as factory } from '__tests__/factory';

describe('PageLayout', () => {
  it('renders the home url', () => {
    const channels = [
      factory('channel', {
        id: 'X1',
        channelName: 'general',
        externalChannelId: 'S1',
        accountId: 'A1',
        hidden: false,
        externalPageCursor: null,
      }),
    ];
    const { baseElement } = render(
      <PageLayout
        communityName="test"
        communityUrl="https://foo.slack.com"
        settings={{
          brandColor: '#fff',
          homeUrl: 'https://foo.com',
          docsUrl: 'https://foo.com/docs',
          logoUrl: 'https://foo.com/logo.png',
          communityType: 'slack',
          googleAnalyticsId: 'UA-123456789-1',
        }}
        channels={channels}
        currentChannel={channels[0]}
        isSubDomainRouting
        permissions={factory('permissions')}
      >
        foo
      </PageLayout>
    );
    expect(baseElement.innerHTML).toContain('https://foo.com');
  });
});
