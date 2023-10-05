function source(children) {
  return children.map((child) => child.source).join('');
}

function root(children) {
  return { type: 'root', children, source: source(children) };
}

function text(value) {
  return { type: 'text', value, source: value };
}

function bold(children) {
  return { type: 'bold', children, source: `*${source(children)}*` };
}

function italic(children) {
  return { type: 'italic', children, source: `_${source(children)}_` };
}

function strike(children) {
  return { type: 'strike', children, source: `~${source(children)}~` };
}

function code(value) {
  return { type: 'code', value, source: `\`${value}\`` };
}

function pre(value, language) {
  return {
    type: 'pre',
    value,
    source: `\`\`\`${
      language ? language + '\n' + value + '\n' : '\n' + value + '\n'
    }\`\`\``,
    language,
  };
}

function user(id) {
  return { type: 'user', id, source: `@${id}` };
}

function signal(id) {
  return { type: 'signal', id, source: `!${id}` };
}

function url(value) {
  if (value.startsWith('[') && value.endsWith(')')) {
    const title = value.substring(1, value.indexOf(']'));
    const url = value.substring(value.indexOf('(') + 1, value.lastIndexOf(')'));
    return { type: 'url', url, value: url, source: value, title: title };
  }
  const [url, title] = value.split('|');
  return { type: 'url', url, value: url, source: value, title: title || url };
}

function quote(children) {
  return {
    type: 'quote',
    children,
    source: `> ${source(children)}`,
  };
}

function header(children, depth = 1) {
  return {
    type: 'header',
    children,
    depth,
    source: `${'#'.repeat(depth)} ${source(children)}`,
  };
}

function list(children, { ordered = false, prefix = '-' } = {}) {
  return {
    type: 'list',
    ordered: ordered,
    children,
    source: children
      .map(
        (child, index) =>
          `${ordered ? `${index + 1}.` : prefix} ${child.source}`
      )
      .join('\n'),
  };
}

function item(children) {
  return {
    type: 'item',
    children,
    source: source(children),
  };
}

module.exports = {
  source,
  root,
  text,
  bold,
  italic,
  strike,
  code,
  pre,
  user,
  signal,
  url,
  quote,
  header,
  list,
  item,
};
