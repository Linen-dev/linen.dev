export function root(children) {
  return { type: 'root', children };
}

export function text(value) {
  return { type: 'text', value };
}

export function code(value) {
  return { type: 'code', value };
}

export function user(value) {
  return { type: 'user', value };
}

export function pre(value) {
  return { type: 'pre', value };
}

export function url(value) {
  return { type: 'url', value };
}
