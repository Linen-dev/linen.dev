import { findAccount } from '../../lib/account';
import prisma from '../../client';

async function cleanup(accountId: string) {
  await prisma.$executeRaw`delete from "slackMentions" where "messagesId" in (
  select sm."messagesId"  from "slackMentions" sm 
  join messages m on sm."messagesId" = m.id 
  join channels c on m."channelId" = c.id 
  where c."accountId" = ${accountId} )`;

  await prisma.$executeRaw`delete from messages where id in (
  select m.id  from messages m 
  join channels c on m."channelId" = c.id 
  where c."accountId" = ${accountId} )`;

  await prisma.$executeRaw`delete from "slackThreads" where id in (
  select st.id  from "slackThreads" st 
  join channels c on st."channelId" = c.id 
  where c."accountId" = ${accountId} )`;

  await prisma.$executeRaw`delete from users where "accountsId" = ${accountId}`;

  await prisma.$executeRaw`delete from channels where "accountId" = ${accountId}`;

  await prisma.$executeRaw`delete from accounts where id = ${accountId}`;
}

(async () => {
  const empty = await findAccount({ redirectDomain: 'empty.dev' });
  if (empty) {
    await cleanup(empty?.id);
  }
  const pulumi = await findAccount({ redirectDomain: 'pulumi.dev' });
  if (pulumi) {
    await cleanup(pulumi?.id);
  }
  const prefect = await findAccount({ redirectDomain: 'prefect.dev' });
  if (prefect) {
    await cleanup(prefect?.id);
  }
})();
