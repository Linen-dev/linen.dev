import { PrismaClient } from '@prisma/client';
import { getSlackUser } from '../pages/api/slack';
import { createUserFromUserInfo, findUser } from '../lib/models';

const prisma = new PrismaClient({});

function getMentionedSlackUserIds(body: string) {
  let mentionSlackUserIds = body.match(/<@(.*?)>/g) || [];
  return mentionSlackUserIds.map((m) => m.replace('<@', '').replace('>', ''));
}

(async () => {
  const accounts = await prisma.accounts.findMany({
    select: {
      id: true,
      name: true,
      slackDomain: true,
      channels: true,
      slackAuthorizations: true,
    },
    where: {
      slackSyncStatus: 'DONE',
    },
  });

  for (const account of accounts) {
    console.log(`Processing account: ${account.name}`);

    for (const channel of account.channels) {
      console.log(`\tProcessing channel: ${channel.channelName}`);

      const messages = await prisma.messages.findMany({
        select: { id: true, body: true },
        where: {
          channelId: channel.id,
        },
      });

      for (const message of messages) {
        const mentionedSlackUserIds = getMentionedSlackUserIds(message.body);

        for (const mentionedSlackUserId of mentionedSlackUserIds) {
          const mentionedUser = await findUser(
            mentionedSlackUserId,
            account.id
          );

          if (mentionedUser) {
            const slackMention = await prisma.slackMentions.findFirst({
              where: {
                messagesId: message.id,
                usersId: mentionedUser.id,
              },
            });

            if (slackMention == null) {
              console.log(
                `\t\t\tAdd mention: ${message.id}/${mentionedUser.displayName}`
              );
              await prisma.slackMentions.create({
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
                mentionedSlackUserId,
                accessToken
              );

              console.log(`\t\t\tAdd user: ${slackUser.name}`);
              const newMentionedUser = await createUserFromUserInfo(
                slackUser,
                account.id
              );

              console.log(
                `\t\t\tAdd mention: ${message.id}/${newMentionedUser.displayName}`
              );
              await prisma.slackMentions.create({
                data: {
                  messagesId: message.id,
                  usersId: newMentionedUser.id,
                },
              });
            }
          }
        }
      }
    }
  }
})();
