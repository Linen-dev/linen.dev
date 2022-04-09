import React from 'react';
import { render } from '@testing-library/react';
import PageLayout from '.';

describe('PageLayout', () => {
  it('renders a google analytics script', () => {
    const channels = [
      {
        id: 'X1',
        channelName: 'general',
        slackChannelId: 'S1',
        accountId: 'A1',
        hidden: false,
        slackNextPageCursor: null,
      },
    ];
    const { container, debug } = render(
      <PageLayout
        communityName="test"
        slackUrl="https://foo.slack.com"
        users={[]}
        settings={{
          brandColor: '#fff',
          homeUrl: 'https://foo.com',
          docsUrl: 'https://foo.com/docs',
          logoUrl: 'https://foo.com/logo.png',
          googleAnalyticsId: 'UA-123456789-1',
        }}
        navItems={{ channels }}
        currentChannel={channels[0]}
        isSubDomainRouting
      >
        foo
      </PageLayout>
    );
    expect(container.innerHTML).toContain(
      '<script async="" src="https://www.googletagmanager.com/gtag/js?id=UA-123456789-1"></script>'
    );
  });
});
