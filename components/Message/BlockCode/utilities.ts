export function isHighlighted(code: string): boolean {
  return code.indexOf('import React from') !== -1;
}
