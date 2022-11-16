import { generateRandomWordSlug } from '../../utilities/randomWordSlugs';
import prisma from '../../client';

async function run() {
  console.log('start', new Date());

  const auths = await prisma.auths.findMany({
    include: {
      users: true,
      account: true,
    },
  });
  for (const auth of auths) {
    const { account, email } = auth;
    if (!account) {
      console.log(email, 'missing account, skip');
      continue;
    }
    const user = auth.users.find((user) => user.accountsId === account.id);
    if (!!user) {
      console.log(email, 'user already exists, skip');
      continue;
    }

    const displayName = email.split('@').shift() || email;

    await prisma.users.create({
      data: {
        isAdmin: true,
        isBot: false,
        account: { connect: { id: account.id } },
        auth: { connect: { id: auth.id } },
        anonymousAlias: generateRandomWordSlug(),
        displayName,
      },
    });
    console.log(email, 'user created');
  }
  console.log('end', new Date());
}

run();
