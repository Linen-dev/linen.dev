import { Roles } from '@prisma/client';
import { UserSession } from 'utilities/session';
import prisma from '../../client';

export async function updateUserRole({
  requesterEmail: email,
  userId,
  role,
}: {
  requesterEmail: string;
  userId: string;
  role: Roles;
}) {
  const auth = await prisma.auths.findFirst({
    where: {
      email,
    },
    include: { users: true },
  });
  if (!auth || !auth.users.length) {
    throw 'requester not found';
  }
  const userToUpdate = await prisma.users.findUnique({
    where: { id: userId },
  });
  if (!userToUpdate) {
    throw 'user not found';
  }
  const userFromSession = auth?.users.find(
    (u) => u.accountsId === userToUpdate.accountsId
  );
  if (!userFromSession) {
    throw "user doesn't belong to same tenant";
  }
  // user requester should be an owner or admin
  if (
    userFromSession.role !== Roles.ADMIN &&
    userFromSession.role !== Roles.OWNER
  ) {
    throw 'requester is not authorized to make this change';
  }
  // the account it should have at least another owner
  if (userToUpdate.role === Roles.OWNER && role !== Roles.OWNER) {
    const anotherOwner = await prisma.users.findFirst({
      where: {
        accountsId: userToUpdate.accountsId,
        role: Roles.OWNER,
        NOT: {
          id: userToUpdate.id,
        },
      },
    });
    if (!anotherOwner) {
      throw 'the account need at least one owner';
    }
  }
  return await prisma.users.update({
    where: { id: userToUpdate.id },
    data: {
      role,
    },
  });
}
