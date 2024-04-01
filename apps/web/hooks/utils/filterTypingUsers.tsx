import { StateType } from './StateType';

export function filterTypingUsers(state: StateType): any {
  const typingUsers: string[] = [];
  for (const [_, user] of Object.entries(state)) {
    typingUsers.push(
      ...user.metas
        .filter((m) => m.typing && m.username)
        .map((m) => m.username!)
    );
  }
  return typingUsers;
}
