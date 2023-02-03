import formatDate from 'date-fns/format';
import add from 'date-fns/add';

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

export function nextWeek() {
  return add(new Date(), { days: 7 });
}
