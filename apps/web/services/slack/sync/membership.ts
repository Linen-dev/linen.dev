import { createMembership } from 'services/membership';
import { GetMembershipsFnType } from '../syncWrapper';

export async function syncMemberships({
  accountId,
  channelId,
  externalChannelId,
  token,
  getMemberships,
}: {
  accountId: string;
  channelId: string;
  externalChannelId: string;
  token: string;
  getMemberships: GetMembershipsFnType;
}) {
  const members = await getMemberships(externalChannelId, token);
  if (members && members.length) {
    for (const member of members) {
      await createMembership({
        channel: { connect: { id: channelId } },
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
