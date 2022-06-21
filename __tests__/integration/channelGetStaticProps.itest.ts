import { channelGetStaticProps } from '../../services/communities';

describe('channelGetStaticProps', () => {
  it('it should return first page of threads from general channel from empty community', async () => {
    const staticProps: any = await channelGetStaticProps(
      {
        params: {
          communityName: 'empty',
          channelName: 'general',
          page: '1',
        },
      },
      false
    );
    const props = staticProps.props;
    expect(props.currentChannel).toMatchObject({
      accountId: expect.any(String),
      id: expect.any(String),
      channelName: expect.stringMatching(/general/),
      slackChannelId: expect.any(String),
    });
    expect(props.pagination).toMatchObject({
      currentPage: 1,
      pageCount: 10,
      perPage: 10,
      totalCount: 100,
    });
    for (const channel of props.channels) {
      expect(channel).toMatchObject({
        accountId: expect.any(String),
        channelName: expect.stringMatching(/alpha|general|sql/),
        id: expect.any(String),
        slackChannelId: expect.any(String),
      });
    }
    for (const thread of props.threads) {
      expect(thread).toMatchObject({
        channelId: expect.any(String),
        id: expect.any(String),
        incrementId: expect.any(Number),
        messageCount: 2,
        slackThreadTs: expect.any(String),
        slug: expect.any(String),
        viewCount: expect.any(Number),
      });
      for (const message of thread.messages) {
        expect(message).toMatchObject({
          author: {
            accountsId: expect.any(String),
            id: expect.any(String),
          },
          body: expect.any(String),
          sentAt: expect.any(String),
        });
      }
    }
    for (const user of props.users) {
      expect(user).toMatchObject({
        accountsId: expect.any(String),
        id: expect.any(String),
      });
    }
  });
});
