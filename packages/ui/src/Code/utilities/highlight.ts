const cache: { [key: string]: Promise<string> } = {};

export async function highlightCode(
  input: string,
  language?: string
): Promise<string> {
  if (!!cache[input]) {
    return cache[input];
  }
  try {
    const promise = fetch('/api/highlight', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ input, language }),
    })
      .then((response) => response.json())
      .then(({ output }) => output);
    cache[input] = promise;
    return promise;
  } catch (exception) {
    console.error(exception);
    return input;
  }
}
