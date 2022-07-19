import { UserMap } from '../../types/partialTypes';

export function getMentionedUsers(text: string, users: UserMap[]) {
  let mentionExternalUserIds = text.match(/<@(.*?)>/g) || [];
  mentionExternalUserIds = mentionExternalUserIds.map((m) =>
    m.replace('<@', '').replace('>', '')
  );

  return users.filter((u) => mentionExternalUserIds.includes(u.externalUserId));
}
