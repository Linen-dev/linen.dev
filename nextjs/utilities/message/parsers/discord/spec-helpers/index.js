export function source(children) {
  return children.map((child) => child.source).join('');
}

export function root(children) {
  return { type: 'root', children, source: source(children) };
}

export function text(value) {
  return { type: 'text', value, source: value };
}

export function bold(children) {
  return { type: 'bold', children, source: `**${source(children)}**` };
}

export function italic(children, character = '_') {
  return {
    type: 'italic',
    children,
    source: `${character}${source(children)}${character}`,
  };
}

export function underline(children) {
  return { type: 'underline', children, source: `__${source(children)}__` };
}

export function strike(children) {
  return { type: 'strike', children, source: `~~${source(children)}~~` };
}

export function code(value) {
  return { type: 'code', value, source: `\`${value}\`` };
}

export function pre(value) {
  return { type: 'pre', value, source: `\`\`\`${value}\`\`\`` };
}

export function spoiler(children) {
  return { type: 'spoiler', children, source: `||${source(children)}||` };
}

export function url(link) {
  return {
    type: 'url',
    url: link,
    value: link,
    source: link,
  };
}
