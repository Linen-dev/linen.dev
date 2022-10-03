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
  return { type: 'bold', children, source: `*${source(children)}*` };
}

export function italic(children) {
  return { type: 'italic', children, source: `_${source(children)}_` };
}

export function strike(children) {
  return { type: 'strike', children, source: `~${source(children)}~` };
}

export function code(value) {
  return { type: 'code', value, source: `\`${value}\`` };
}

export function pre(value) {
  return { type: 'pre', value, source: `\`\`\`${value}\`\`\`` };
}

export function user(id) {
  return { type: 'user', id, source: `@${id}` };
}

export function url(value) {
  return { type: 'url', url: value, value, source: value };
}

export function quote(children) {
  return {
    type: 'quote',
    children,
    source: `> ${source(children)}`,
  };
}
