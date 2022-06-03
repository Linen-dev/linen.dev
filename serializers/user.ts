export interface SerializedUser {
  id: string;
  slackUserId: string;
  displayName: string | null;
  profileImageUrl: string | null;
  isBot: boolean;
  isAdmin: boolean;
  anonymousAlias: string | null;
  accountsId: string;
}

export default function serialize(user?: any): SerializedUser | null {
  if (!user) {
    return null;
  }

  const {
    id,
    slackUserId,
    displayName,
    profileImageUrl,
    isBot,
    isAdmin,
    anonymousAlias,
    accountsId,
  } = user;

  return {
    id,
    slackUserId,
    displayName,
    profileImageUrl,
    isBot,
    isAdmin,
    anonymousAlias,
    accountsId,
  };
}
