export function isHighlighted(code: string): boolean {
  return code.includes('\n');
}

export function isFormattable(code: string): boolean {
  return isJSON(code);
}

function isJSON(code: string): boolean {
  const input = code.trim();
  if (!input.startsWith('{') || !input.endsWith('}')) {
    return false;
  }
  try {
    const output = JSON.parse(input);
    return typeof output === 'object';
  } catch (exception) {
    return false;
  }
}

export function formatCode(code: string): string {
  if (isJSON(code)) {
    return formatJSON(code);
  }
  return code;
}

function formatJSON(code: string): string {
  try {
    return JSON.stringify(JSON.parse(code), null, 2);
  } catch (exception) {
    return code;
  }
}
