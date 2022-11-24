import superjson from 'superjson';

export function serialize(data: any) {
  const { json } = superjson.serialize(data);
  return json;
}
