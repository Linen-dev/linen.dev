import { Roles } from '@linen/types';

export function isManager(role?: Roles) {
  if (role === Roles.OWNER) return true;
  if (role === Roles.ADMIN) return true;
  return false;
}

export function isNotManager(role?: Roles) {
  return !isManager(role);
}

export function isMember(role?: Roles) {
  return role === Roles.MEMBER;
}
