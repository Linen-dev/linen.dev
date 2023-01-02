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

function pre(value) {
  return { type: 'pre', value, source: `\`\`\`${value}\`\`\`` };
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

function command(name, args = [], label) {
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

function url(link, label) {
  return {
    type: 'url',
    url: link,
    label,
    value: link + (label ? '|' + source(label) : ''),
    source: `<${link}${label ? '|' + source(label) : ''}>`,
    title: label ? source(label) : link
  };
}

function quote(children) {
  return {
    type: 'quote',
    children,
    source: `${'&gt;'}${source(children)}`,
  };
}

function emoji(name, variation) {
  return {
    type: 'emoji',
    name,
    variation,
    source: `:${name}${variation ? '::' + variation : ''}:`,
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
  channel,
  command,
  url,
  quote,
  emoji,
};
