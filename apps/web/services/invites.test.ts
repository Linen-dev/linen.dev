import { updateInvitation } from './invites';
import { Roles } from '@linen/types';
import { prisma } from '@linen/database';
import { v4 } from 'uuid';

describe('invite service', () => {
  describe('update invite', () => {
    test('as admin, update invite from same tenant should succeed', async () => {
      const account = await prisma.accounts.create({ data: {} });
      const requester = await prisma.auths.create({
        data: {
          email: v4(),
          password: '',
          salt: '',
          account: { connect: { id: account.id } },
        },
      });
      const requesterUser = await prisma.users.create({
        data: {
          isAdmin: true,
          isBot: false,
          role: Roles.OWNER,
          account: { connect: { id: account.id } },
          auth: { connect: { id: requester.id } },
        },
      });
      const inviteToUpdate = await prisma.invites.create({
        data: {
          email: v4(),
          role: Roles.MEMBER,
          accounts: { connect: { id: account.id } },
          createdBy: { connect: { id: requesterUser.id } },
        },
      });
      await expect(
        updateInvitation({
          accountId: account.id,
          role: Roles.ADMIN,
          inviteId: inviteToUpdate.id,
        })
      ).resolves.toMatchObject({ status: 200, message: 'invitation updated' });
    });

    test.skip('as admin, update invite from distinct tenant should fail', async () => {});

    test.skip('as member, update an invite role should fail', async () => {});
  });
});
