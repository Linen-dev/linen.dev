import React from 'react';
import { render } from '@testing-library/react';
import Channel from './Channel';

describe('Channel', () => {
  describe('and google analytics id is set', () => {
    it.skip('renders a script tag', () => {
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
      const { container } = render(
        <Channel
          channelId={channels[0].id}
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
          threads={[]}
          channels={channels}
          currentChannel={channels[0]}
          isSubDomainRouting
        />
      );
      expect(container.innerHTML).toContain(
        '<script async="" src="https://www.googletagmanager.com/gtag/js?id=UA-123456789-1"></script>'
      );
    });
  });
});
