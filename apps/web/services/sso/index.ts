import { prisma } from '@linen/database';

export const getSsoSession = async (id: string) => {
  return await prisma.session.delete({
    where: { id },
    select: { sessionToken: true },
  });
};

export const createSsoSession = async (
  userId: string,
  encryptedToken: string
) => {
  const { id: state } = await prisma.session.create({
    data: {
      expires: new Date(Date.now() + 5 * 60 * 60 * 60),
      sessionToken: encryptedToken,
      userId,
    },
  });
  return state;
};
