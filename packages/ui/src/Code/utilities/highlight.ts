const cache: { [key: string]: Promise<string> } = {};

export function highlightCode(input: string): Promise<string> {
  if (!!cache[input]) {
    return cache[input];
  }
  // FIXME
  const promise = fetch('/api/highlight', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ input }),
  })
    .then((response) => response.json())
    .then(({ output }) => output);
  cache[input] = promise;
  return promise;
}
