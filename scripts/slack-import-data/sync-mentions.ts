import { PrismaClient } from '@prisma/client';
import { getSlackUser } from '../../services/slack';
import { createUserFromUserInfo, findUser } from '../../lib/models';

const prisma = new PrismaClient({});

function getMentionedExternalUserIds(body: string) {
  let mentionExternalUserIds = body.match(/<@(.*?)>/g) || [];
  return mentionExternalUserIds.map((m) =>
    m.replace('<@', '').replace('>', '')
  );
}

(async () => {
  const args = process.argv.slice(2);
  let fromAccount = args.length > 0 ? args[0] : null;
  let fromChannel = args.length > 1 ? args[1] : null;

  const accounts = await prisma.accounts.findMany({
    select: {
      id: true,
      name: true,
      slackDomain: true,
      channels: true,
      slackAuthorizations: true,
    },
    where: {
      syncStatus: 'DONE',
    },
  });

  for (const account of accounts) {
    if (fromAccount) {
      if (account.name !== fromAccount) {
        console.log(`[INFO] Skip account: ${account.name}`);
        continue;
      } else {
        fromAccount = null;
      }
    }

    console.log(`[INFO] Processing account: ${account.name}`);

    for (const channel of account.channels) {
      if (fromChannel) {
        if (channel.channelName !== fromChannel) {
          console.log(`[INFO] Skip channel: ${channel.channelName}`);
          continue;
        } else {
          fromChannel = null;
        }
      }

      console.log(`[INFO] Processing channel: ${channel.channelName}`);

      const messages = await prisma.messages.findMany({
        select: { id: true, body: true },
        where: {
          channelId: channel.id,
        },
      });

      for (const message of messages) {
        const mentionedExternalUserIds = getMentionedExternalUserIds(
          message.body
        );

        for (const mentionedExternalUserId of mentionedExternalUserIds) {
          const mentionedUser = await findUser(
            mentionedExternalUserId,
            account.id
          );

          if (mentionedUser) {
            const slackMention = await prisma.mentions.findFirst({
              where: {
                messagesId: message.id,
                usersId: mentionedUser.id,
              },
            });

            if (slackMention == null) {
              console.log(
                `[INFO] Add mention: ${account.name}/${channel.channelName}/${message.id}/${mentionedUser.displayName}`
              );
              await prisma.mentions.create({
                data: {
                  messagesId: message.id,
                  usersId: mentionedUser.id,
                },
              });
            }
          } else {
            const accessToken = account?.slackAuthorizations[0]?.accessToken;
            if (!!accessToken) {
              const slackUser = await getSlackUser(
                mentionedExternalUserId,
                accessToken
              );

              if (slackUser) {
                console.log(
                  `[INFO] Add user: ${account.name}/${channel.channelName}/${slackUser.name}`
                );
                const newMentionedUser = await createUserFromUserInfo(
                  slackUser,
                  account.id
                );

                console.log(
                  `[INFO] Add mention: ${account.name}/${channel.channelName}/${message.id}/${newMentionedUser.displayName}`
                );
                await prisma.mentions.create({
                  data: {
                    messagesId: message.id,
                    usersId: newMentionedUser.id,
                  },
                });
              } else {
                console.log(
                  `[ERROR] Slack user not found: ${account.name}/${channel.channelName}/${mentionedExternalUserId}`
                );
              }
            }
          }
        }
      }
    }
  }
})();
