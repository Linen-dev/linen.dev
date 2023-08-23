import { accounts, channels, prisma } from '@linen/database';
import { v4 as random } from 'uuid';
import { MessageFormat } from '@linen/types';
import { buildPages } from '@linen/pagination';
/** this function will create N threads (threadsCount parameter)
 * where each one will have a incremental timestamp date
 * the first thread will get the N amount of day in the past from now.
 * each thread will have 2 messages with 1 minute of difference between them.
 * it will also create one user that will be the author and replier.
 *
 * @param channel prisma model
 * @param account prisma model
 * @param threadsCount amount of threads to be created
 * @returns array of threads
 */
export async function createThreadsOneByDay(
  channel: channels,
  account: accounts,
  threadsCount: number
) {
  const user = await prisma.users.create({
    data: {
      isAdmin: true,
      isBot: false,
      accountsId: account.id,
    },
  });

  const oneDay = 24 * 60 * 60 * 1000;
  const oneMinute = 1 * 60 * 1000;
  const nDays = threadsCount * oneDay;
  const date = new Date().getTime() - nDays;

  const threads = [];
  for (let i = 0; i < threadsCount; i++) {
    const thread = await prisma.threads.create({
      data: {
        channelId: channel.id,
        slug: `slug-${channel.channelName}-${channel.id}-${i}`,
        messageCount: 2,
        externalThreadId: `thread-ts-${random()}`,
        sentAt: date + i * oneDay,
        lastReplyAt: date + i * oneDay,
      },
    });
    await prisma.messages.create({
      data: {
        body: `foo-${i}-${random()}`,
        channelId: channel.id,
        threadId: thread.id,
        usersId: user.id,
        sentAt: new Date(date + i * oneDay).toISOString(),
        messageFormat: MessageFormat.LINEN,
      },
    });
    await prisma.messages.create({
      data: {
        body: `foo-${i}-${random()}`,
        channelId: channel.id,
        threadId: thread.id,
        usersId: user.id,
        sentAt: new Date(date + i * oneDay + oneMinute).toISOString(),
        messageFormat: MessageFormat.LINEN,
      },
    });
    threads.push(thread);
  }
  await buildPages(account);
  return threads;
}
