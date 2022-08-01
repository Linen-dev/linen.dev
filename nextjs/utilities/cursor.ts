export function encodeCursor(data: string) {
  return Buffer.from(data).toString('base64');
}

export function decodeCursor(data: string) {
  return Buffer.from(data, 'base64').toString();
}
