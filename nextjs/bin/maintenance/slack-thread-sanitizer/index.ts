import prisma from '../../../client';

const BATCH = 25;
let empty = 0;

export async function sanitizeThreads() {
  let count = BATCH;
  do {
    count = await sanitize();
    console.log({ empty });
  } while (count === BATCH);
}

async function sanitize() {
  // read each thread with message authors
  const threads = await getThreads();

  for (const thread of threads) {
    // set first message body as title and description
    const message1 = thread.messages[0];
    if (!message1) {
      console.log('empty thread', thread.id);
      empty++;
      await updateThread(thread.id, {
        title: thread.slug || 'topic',
        description: thread.slug || '',
      });
      continue;
    }

    const data = {
      title: message1.body,
      description: message1.body,
    };
    // if next message is from same author, append it to description
    if (
      thread.messages.length > 1 &&
      thread.messages[0].usersId === thread.messages[1].usersId
    ) {
      data.description += ' ' + thread.messages[1].body;
    }
    await updateThread(thread.id, data);
    // for each author, insert a replier for given thread
    const authors = thread.messages.map((message) => message.usersId);
    await createManyRepliers(thread.id, authors as string[]);
  }
  return threads.length;
}

async function getThreads() {
  return await prisma.threads.findMany({
    take: BATCH,
    where: {
      OR: [{ title: null }, { description: null }],
    },
    include: {
      messages: {
        orderBy: { sentAt: 'asc' },
      },
    },
  });
}

async function updateThread(
  threadId: string,
  data: { title: string; description: string }
) {
  await prisma.threads.update({
    data,
    where: { id: threadId },
  });
}

async function createManyRepliers(threadId: string, authors: string[]) {
  const users = authors.filter((el, i, array) => el && array.indexOf(el) === i);
  await prisma.repliers.createMany({
    data: users.map((userId) => ({
      threadId,
      userId,
    })),
    skipDuplicates: true,
  });
}
