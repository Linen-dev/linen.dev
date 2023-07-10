import formatDate from 'date-fns/format';
import utilFormatDistance from 'date-fns/formatDistance';
import add from 'date-fns/add';
import sub from 'date-fns/sub';
import formatDistanceToNow from 'date-fns/formatDistanceToNow';

export function format(date: string, pattern: string = 'p'): string {
  return formatDate(new Date(date), pattern);
}

export function timestamp() {
  return new Date().getTime();
}

export function soon() {
  return add(new Date(), { minutes: 20 });
}

export function tomorrow() {
  return add(new Date(), { days: 1 });
}

export function yesterday() {
  return sub(new Date(), { days: 1 });
}

export function nextWeek() {
  return add(new Date(), { days: 7 });
}

export function lastWeek() {
  return sub(new Date(), { days: 7 });
}

export function formatDistance(date: string): string {
  return utilFormatDistance(new Date(), new Date(date));
}

export function timeAgo(date: string | number) {
  return formatDistanceToNow(typeof date === 'number' ? date : new Date(date), {
    addSuffix: true,
  });
}
