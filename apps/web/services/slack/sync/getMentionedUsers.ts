import { UserMap } from '@linen/types';

export function getMentionedUsers(text: string, users: UserMap[]) {
  let mentionExternalUserIds = text.match(/<@(.*?)>/g);
  let mentionsMap = mentionExternalUserIds?.map((m) =>
    m.replace('<@', '').replace('>', '')
  );

  return users.filter((u) => mentionsMap?.includes(u.externalUserId || u.id));
}
