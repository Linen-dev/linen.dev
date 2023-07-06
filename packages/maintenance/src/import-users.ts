// ts-node -P tsconfig.commonjs.json bin/import-users/index.ts

import Papa from 'papaparse';
import fs from 'fs';
import { Prisma, Roles, prisma } from '@linen/database';
import { generateRandomWordSlug } from '@linen/utilities/randomWordSlugs';
import { v4 } from 'uuid';

type SlackRole =
  | 'Member'
  | 'Deactivated'
  | 'Primary Owner'
  | 'Admin'
  | 'Owner'
  | 'Bot';

type Users = {
  username: string;
  email: string;
  status: SlackRole;
  'billing-active': '0' | '1';
  'has-2fa': '0' | '1';
  'has-sso': '0' | '1';
  userid: string;
  fullname: string;
  displayname: string;
  'expiration-timestamp': string;
};

const mapRole = (role: SlackRole): Roles => {
  if (role === 'Admin') return Roles.ADMIN;
  if (role === 'Owner') return Roles.OWNER;
  if (role === 'Primary Owner') return Roles.OWNER;
  return Roles.MEMBER;
};

const isAdmin = (role: SlackRole): boolean => {
  if (role === 'Admin') return true;
  if (role === 'Owner') return true;
  if (role === 'Primary Owner') return true;
  return false;
};

const isBot = (role: SlackRole): boolean => {
  if (role === 'Bot') return true;
  return false;
};

const shouldCreateAuth = (role: SlackRole): boolean => {
  if (role === 'Deactivated') return false;
  if (role === 'Bot') return false;
  return true;
};

async function run() {
  if (process.argv.length < 4) {
    throw 'missing params, try: npm run script:import-user -- "accountId" "/full/path/file.csv"';
  }
  const accountId = process.argv[2];
  const file = fs.readFileSync(process.argv[3]);

  const { data } = Papa.parse(file.toString(), {
    header: true,
    skipEmptyLines: true,
  });
  const users = data as Users[];

  const toUpsert: Prisma.usersCreateInput[] = users.map((user) => {
    return {
      account: { connect: { id: accountId } },
      anonymousAlias: generateRandomWordSlug(),
      ...(shouldCreateAuth(user.status) && {
        auth: {
          connectOrCreate: {
            create: {
              email: user.email,
              password: v4(),
              salt: v4(),
              accountId,
            },
            where: { email: user.email },
          },
        },
      }),
      displayName: user.displayname || user.username,
      externalUserId: user.userid,
      role: mapRole(user.status),
      isAdmin: isAdmin(user.status),
      isBot: isBot(user.status),
    };
  });

  await Promise.all(
    toUpsert.map((data) =>
      prisma.users.upsert({
        create: data,
        update: data,
        where: {
          externalUserId_accountsId: {
            accountsId: accountId,
            externalUserId: data.externalUserId!,
          },
        },
      })
    )
  );
}

run().catch(console.error);
