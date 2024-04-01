export function matches(query: string, title: string): boolean {
  return !query || title.toLowerCase().includes(query.toLowerCase());
}
