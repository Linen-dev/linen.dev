import type { channels } from '@prisma/client';
import { createMembership } from 'lib/membership';
import { GetMembershipsFnType } from '../syncWrapper';

export async function syncMemberships({
  accountId,
  channel,
  token,
  getMemberships,
}: {
  accountId: string;
  channel: channels;
  token: string;
  getMemberships: GetMembershipsFnType;
}) {
  const members = await getMemberships(channel.externalChannelId, token);
  if (members && members.length) {
    for (const member of members) {
      await createMembership({
        channel: { connect: { id: channel.id } },
        user: {
          connect: {
            externalUserId_accountsId: {
              accountsId: accountId,
              externalUserId: member,
            },
          },
        },
      });
    }
  }
}
