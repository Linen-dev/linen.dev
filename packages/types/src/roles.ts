import { makeEnum } from './utils/makeEnum';

export const Roles = makeEnum({
  OWNER: 'OWNER',
  ADMIN: 'ADMIN',
  MEMBER: 'MEMBER',
});

export type Roles = typeof Roles[keyof typeof Roles];
