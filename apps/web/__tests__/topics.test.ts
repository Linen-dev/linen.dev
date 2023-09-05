import { createAccount, createChannel } from '@linen/factory';
import {
  SerializedThread,
  SerializedTopic,
  accounts,
  channels,
} from '@linen/types';
import { createThreadsOneByDay } from 'bin/factory/threads';
import crypto from 'crypto';
import { testApiHandler } from 'next-test-api-route-handler';
import { topicGetServerSideProps } from 'services/ssr/topics';
import handler from 'pages/api/threads/[[...slug]]';
import { qs } from '@linen/utilities/url';

const random = () => 's' + crypto.randomUUID();

describe('topic view', () => {
  jest.setTimeout(10 * 1000);
  let account: accounts;
  let channel: channels;
  const threadsCount = 70;
  const isSubdomain = true;

  beforeAll(async () => {
    account = await createAccount({
      premium: true,
      redirectDomain: `${random()}.${random()}.com`,
      slackDomain: random(),
    });
    channel = await createChannel({
      channelName: random(),
      externalChannelId: random(),
      hidden: false,
      accountId: account.id,
    });
    await createThreadsOneByDay(channel, account, threadsCount);
  });

  test('ssr (initial) + api (load-more)', async () => {
    const results = await topicGetServerSideProps(
      {
        params: {
          communityName: account.redirectDomain as string,
          channelName: channel.channelName,
        },
      } as any,
      isSubdomain
    );
    expect(results).toMatchObject({ props: expect.any(Object) });
    if ('props' in results) {
      const { threads, topics } = results.props;
      expect(topics).toHaveLength(30);
      expect(threads).not.toHaveLength(0);

      for (let topic of topics) {
        const thread = threads.find((t) => t.id === topic.threadId);
        expect(thread).toBeDefined();
        const messageThread = threads.find((t) =>
          t.messages.find((m) => m.id === topic.messageId)
        );
        expect(messageThread).toStrictEqual(thread);
      }

      const cursorTopic = topics[topics.length - 1].sentAt;

      const req = {
        accountId: account.id,
        channelId: channel.id,
        sentAt: cursorTopic,
      };

      await testApiHandler({
        handler: handler as any,
        url: `/api/threads/topics?${qs(req)}`,
        test: async ({ fetch }) => {
          const response = await fetch({
            method: 'GET',
          });
          const results = await response.json();
          expect(results).toMatchObject({
            threads: expect.any(Object),
            topics: expect.any(Object),
          });
          const { threads, topics } = results as {
            threads: SerializedThread[];
            topics: SerializedTopic[];
          };
          expect(topics).toHaveLength(30);
          expect(threads).not.toHaveLength(0);

          for (let topic of topics) {
            const thread = threads.find((t) => t.id === topic.threadId);
            expect(thread).toBeDefined();
            const messageThread = threads.find((t) =>
              t.messages.find((m) => m.id === topic.messageId)
            );
            expect(messageThread).toStrictEqual(thread);
          }
        },
      });
    }
  });
});
