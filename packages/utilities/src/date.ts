import formatDate from 'date-fns/format';

export function format(date: string, pattern: string = 'p'): string {
  return formatDate(new Date(date), pattern);
}
