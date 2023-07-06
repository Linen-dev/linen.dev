import { prisma } from '@linen/database';
import { slugify } from '@linen/utilities/string';

const random = () => 'r-' + (Math.random() + 1).toString(36).substring(2);

(async function () {
  const result = await prisma.accounts.findMany({
    select: {
      name: true,
      discordDomain: true,
      discordServerId: true,
      id: true,
      communityUrl: true,
      redirectDomain: true,
    },
    where: {
      slackDomain: null,
    },
  });

  const dups = [];
  const dups2 = [];
  for (const account of result) {
    let slackDomain = slugify(
      account.discordDomain ||
        account.communityUrl ||
        account.name?.replace("'s server", '') ||
        account.redirectDomain ||
        account.discordServerId ||
        random()
    )
      .replace('https-', '')
      .replace('-slack-com', '')
      .substring(0, 35);

    if (slackDomain === 'conversation') {
      slackDomain = random();
    }

    try {
      await prisma.accounts.update({
        where: { id: account.id },
        data: { slackDomain },
      });
    } catch (error) {
      dups.push(account.id);
      dups2.push(slackDomain);
    }
  }
  console.dir(dups, { maxArrayLength: null });
  console.dir(dups2, { maxArrayLength: null });
})();
