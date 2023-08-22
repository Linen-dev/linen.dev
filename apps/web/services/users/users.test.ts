import UsersServices from '.';
import { Roles } from '@linen/types';
import { prisma } from '@linen/database';
import { v4 } from 'uuid';

describe('user service', () => {
  describe('update user', () => {
    test('as admin, update user from same tenant should succeed', async () => {
      const account = await prisma.accounts.create({ data: {} });
      const userToUpdate = await prisma.users.create({
        data: {
          isAdmin: true,
          isBot: false,
          role: Roles.MEMBER,
          account: { connect: { id: account.id } },
        },
      });
      await expect(
        UsersServices.updateUserRole({
          role: Roles.ADMIN,
          userId: userToUpdate.id,
        })
      ).resolves.toMatchObject({
        accountsId: account.id,
        anonymousAlias: null,
        authsId: null,
        displayName: null,
        externalUserId: null,
        id: userToUpdate.id,
        isAdmin: true,
        isBot: false,
        profileImageUrl: null,
        role: Roles.ADMIN,
      });
    });

    test('as owner, update itself to other role without another owner should fail', async () => {
      const account = await prisma.accounts.create({ data: {} });
      const requester = await prisma.auths.create({
        data: {
          email: v4(),
          password: '',
          salt: '',
          account: { connect: { id: account.id } },
        },
      });
      const userToUpdate = await prisma.users.create({
        data: {
          isAdmin: true,
          isBot: false,
          role: Roles.OWNER,
          account: { connect: { id: account.id } },
          auth: { connect: { id: requester.id } },
        },
      });

      await expect(
        UsersServices.updateUserRole({
          role: Roles.ADMIN,
          userId: userToUpdate.id,
        })
      ).rejects.toEqual('the account need at least one owner');
    });
  });
});
