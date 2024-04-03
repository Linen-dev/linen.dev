export default function createRequest(options?: object) {
  const request = {
    method: 'GET',
    body: '{}',
    headers: {},
    ...options,
  } as any;
  if (typeof request.body === 'object') {
    request.body = JSON.stringify(request.body);
  }
  return request;
}
