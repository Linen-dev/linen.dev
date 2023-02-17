import { Team, User } from '@linear/sdk';

export function parseTeam({ id, key, name }: Team) {
  return { id, key, name };
}

export function parseUser({ id, displayName, email, avatarUrl, admin }: User) {
  return {
    id,
    displayName,
    email,
    avatarUrl,
    admin,
  };
}
