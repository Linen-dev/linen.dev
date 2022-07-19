import React from 'react';
import { render } from '@testing-library/react';
import Channel, { uniqueUsers } from './Channel';
import { users } from '@prisma/client';

describe('Channel', () => {
  describe('and google analytics id is set', () => {
    it.skip('renders a script tag', () => {
      const channels = [
        {
          id: 'X1',
          channelName: 'general',
          externalChannelId: 'S1',
          accountId: 'A1',
          hidden: false,
          externalPageCursor: null,
        },
      ];
      const { container } = render(
        <Channel
          channelId={channels[0].id}
          communityName="test"
          communityUrl="https://foo.slack.com"
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

describe('uniqueUsers', () => {
  const user1 = {
    accountsId: '2',
    externalUserId: '1',
    isBot: false,
    isAdmin: false,
    displayName: 'John Doe',
    profileImageUrl: 'someS3Url2',
    id: '1',
    anonymousAlias: 'fakeAlias1',
  };
  const user2 = {
    accountsId: '2',
    externalUserId: '2',
    isBot: false,
    isAdmin: false,
    displayName: 'Jane Doe',
    profileImageUrl: 'someS3Url2',
    id: '2',
    anonymousAlias: 'fakeAlias2',
  };
  const users: users[] = [user1, user2, user1, user2];
  it('finds unique users from a list', () => {
    const userResult = uniqueUsers(users);
    expect(userResult.length).toEqual(2);
    expect(userResult.includes(user1)).toEqual(true);
    expect(userResult.includes(user2)).toEqual(true);
  });
});
