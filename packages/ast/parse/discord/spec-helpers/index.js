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
  return { type: 'bold', children, source: `**${source(children)}**` };
}

function italic(children, character = '_') {
  return {
    type: 'italic',
    children,
    source: `${character}${source(children)}${character}`,
  };
}

function underline(children) {
  return { type: 'underline', children, source: `__${source(children)}__` };
}

function strike(children) {
  return { type: 'strike', children, source: `~~${source(children)}~~` };
}

function code(value) {
  return { type: 'code', value, source: `\`${value}\`` };
}

function pre(value) {
  return { type: 'pre', value, source: `\`\`\`${value}\`\`\`` };
}

function spoiler(children) {
  return { type: 'spoiler', children, source: `||${source(children)}||` };
}

function url(link) {
  return {
    type: 'url',
    url: link,
    value: link,
    source: link,
  };
}

function user(id, label) {
  return {
    type: 'user',
    id,
    label,
    source: `<@${id}${label ? '|' + source(label) : ''}>`,
  };
}

function channel(id, label) {
  return {
    type: 'channel',
    id,
    label,
    value: id + (label ? '|' + source(label) : ''),
    source: `<#${id}${label ? '|' + source(label) : ''}>`,
  };
}

module.exports = {
  source,
  root,
  text,
  bold,
  italic,
  underline,
  strike,
  code,
  pre,
  spoiler,
  url,
  user,
  channel,
};
