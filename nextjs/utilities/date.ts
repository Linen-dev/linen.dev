import { format as timeago } from 'timeago.js';

export function format(date: string): string {
  return timeago(new Date(date));
}
