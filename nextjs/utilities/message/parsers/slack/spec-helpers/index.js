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

export function user(id, label) {
  return {
    type: 'user',
    id,
    label,
    source: `<@${id}${label ? '|' + source(label) : ''}>`,
  };
}

export function channel(id, label) {
  return {
    type: 'channel',
    id,
    label,
    value: id + (label ? '|' + source(label) : ''),
    source: `<#${id}${label ? '|' + source(label) : ''}>`,
  };
}

export function command(name, args = [], label) {
  return {
    type: 'command',
    name,
    arguments: args,
    label,
    source: `<!${name}${args.map((arg) => `^${arg}`).join('')}${
      label ? '|' + source(label) : ''
    }>`,
  };
}

export function url(link, label) {
  return {
    type: 'url',
    url: link,
    label,
    value: link + (label ? '|' + source(label) : ''),
    source: `<${link}${label ? '|' + source(label) : ''}>`,
  };
}

export function quote(children) {
  return {
    type: 'quote',
    children,
    source: `${'&gt;'}${source(children)}`,
  };
}

export function emoji(name, variation) {
  return {
    type: 'emoji',
    name,
    variation,
    source: `:${name}${variation ? '::' + variation : ''}:`,
  };
}
