export const regexp =
  (pattern: RegExp, callback: any) => (text: string, position: number) => {
    const match = text.substring(position).match(pattern);

    if (!match) {
      return null;
    }

    return callback(match, text, position);
  };

export const explicit = (matcher: any) => (text: string, position: number) => {
  const previous = text[position - 1];

  if (previous && !previous.match(/[\s.,([{!?\-=]/)) {
    return null;
  }

  return matcher(text, position);
};

export const topline = (matcher: any) => (text: string, position: number) => {
  if (position > 0 && text.charAt(position - 1) !== '\n') {
    return null;
  }

  return matcher(text, position);
};

export const deep =
  (type: string, callback: any) =>
  (match: [string, string], _: string, position: number) => {
    const [result, content] = match;

    return [
      {
        type,
        children: callback(content),
        source: result,
      },
      position + result.length,
    ];
  };

export const shallow =
  (type: string) => (match: [string, string], _: string, position: number) => {
    const [result, content] = match;

    return [
      {
        type,
        value: content,
        source: result,
      },
      position + result.length,
    ];
  };

export const root = (input: string, children: any[]) => ({
  type: 'root',
  children,
  source: input,
});
