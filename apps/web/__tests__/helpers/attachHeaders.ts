export function attachHeaders({
  token,
  apiKey,
}: { token?: string; apiKey?: string } = {}) {
  return {
    headers: {
      'Content-Type': 'application/json',
      ...(!!token && { Authorization: `Bearer ${token}` }),
      ...(!!apiKey && { 'X-Api-Key': apiKey }),
    },
  };
}
