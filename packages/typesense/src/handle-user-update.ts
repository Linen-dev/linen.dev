import { Logger } from '@linen/types';
import {
  getAccountSettings,
  pushToTypesense,
  queryThreads,
} from './utils/shared';

export async function handleUserNameUpdate({
  userId,
  accountId,
  logger,
}: {
  userId: string;
  accountId: string;
  logger: Logger;
}) {
  const { searchSettings } = await getAccountSettings(accountId);

  let cursor = 0;
  do {
    const threads = await queryThreads({
      where: {
        messages: {
          some: {
            OR: [
              {
                author: { id: userId },
              },
              { mentions: { some: { usersId: userId } } },
            ],
          },
        },
        incrementId: { gt: cursor },
      },
      orderBy: { incrementId: 'asc' },
      take: 300,
    });

    if (!threads.length) {
      break;
    }

    cursor = threads.at(threads.length - 1)?.incrementId!;

    await pushToTypesense({
      threads,
      is_restrict: searchSettings.scope === 'private',
      logger,
    });
  } while (true);
}
