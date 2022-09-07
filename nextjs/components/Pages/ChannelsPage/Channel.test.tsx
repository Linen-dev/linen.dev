import React from 'react';
import { render } from '@testing-library/react';
import ChannelPage from './ChannelPage';
import type { MessagesViewType, users } from '@prisma/client';
import { create as factory } from '__tests__/factory';

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
        <ChannelPage
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
          permissions={factory('permissions')}
          isSubDomainRouting
        />
      );
      expect(container.innerHTML).toContain(
        '<script async="" src="https://www.googletagmanager.com/gtag/js?id=UA-123456789-1"></script>'
      );
    });
  });

  const channelProps = {
    channelName: 'channelName',
    currentChannel: {
      accountId: 'accountId',
      channelName: 'channelName',
      default: true,
      externalChannelId: 'externalChannelId',
      externalPageCursor: 'externalPageCursor',
      hidden: false,
      id: 'id',
    },
    isBot: false,
    isSubDomainRouting: true,
    nextCursor: {
      next: 'next',
      prev: 'prev',
    },
    pathCursor: 'pathCursor',
    permissions: factory('permissions'),
    settings: {
      brandColor: 'brandColor',
      communityInviteUrl: 'communityInviteUrl',
      communityName: 'communityName',
      communityType: 'communityType',
      communityUrl: 'communityUrl',
      docsUrl: 'docsUrl',
      homeUrl: 'homeUrl',
      logoUrl: 'logoUrl',
      messagesViewType: 'THREADS' as MessagesViewType,
      name: 'name',
    },
    threads: [
      {
        channelId: 'channelId',
        externalThreadId: 'externalThreadId',
        id: 'id',
        incrementId: 1,
        messageCount: 2,
        messages: [
          {
            attachments: [],
            body: 'body',
            id: 'id',
            mentions: [],
            reactions: [],
            sentAt: 'sentAt',
            usersId: 'usersId',
          },
        ],
        sentAt: 'sentAt',
        slug: 'slug',
        viewCount: 1,
      },
    ],
    channels: [],
  };
  test('it should render the view for bots with pagination buttons', () => {
    const { container } = render(
      <ChannelPage {...channelProps} isBot={true} />
    );
    expect(container.innerHTML).not.toMatch(
      new RegExp(
        '<div class="m-3"><div class="spinner-wrapper"><div class="spinner" role="spinner"><div class="spinner-icon"></div></div></div></div>'
      )
    );
    expect(container.innerHTML).toMatch(
      new RegExp('<a href="/c/channelName/prev" class="btn">Previous</a>')
    );
    expect(container.innerHTML).toMatch(
      new RegExp('<a href="/c/channelName/next" class="btn ml-3">Next</a>')
    );
  });

  test('it should render the view for users without pagination buttons', () => {
    const { container } = render(
      <ChannelPage {...channelProps} isBot={false} />
    );
    expect(container.innerHTML).not.toMatch(
      new RegExp('<a href="/c/channelName/prev" class="btn">Previous</a>')
    );
    expect(container.innerHTML).not.toMatch(
      new RegExp('<a href="/c/channelName/next" class="btn ml-3">Next</a>')
    );
    expect(container.innerHTML).toMatch(
      new RegExp(
        '<div class="m-3"><div class="spinner-wrapper"><div class="spinner" role="spinner"><div class="spinner-icon"></div></div></div></div>'
      )
    );
  });
});

// describe('uniqueUsers', () => {
//   const user1 = {
//     accountsId: '2',
//     externalUserId: '1',
//     isBot: false,
//     isAdmin: false,
//     displayName: 'John Doe',
//     profileImageUrl: 'someS3Url2',
//     id: '1',
//     anonymousAlias: 'fakeAlias1',
//   };
//   const user2 = {
//     accountsId: '2',
//     externalUserId: '2',
//     isBot: false,
//     isAdmin: false,
//     displayName: 'Jane Doe',
//     profileImageUrl: 'someS3Url2',
//     id: '2',
//     anonymousAlias: 'fakeAlias2',
//   };
//   const users: users[] = [user1, user2, user1, user2];
//   it('finds unique users from a list', () => {
//     const userResult = uniqueUsers(users);
//     expect(userResult.length).toEqual(2);
//     expect(userResult.includes(user1)).toEqual(true);
//     expect(userResult.includes(user2)).toEqual(true);
//   });
// });
