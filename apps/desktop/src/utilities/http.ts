import { fetch, Body } from '@tauri-apps/api/http';
const HOST = 'http://localhost:3000';
// const HOST = 'https://linen.dev';

export async function get(url: string, token?: string): Promise<any> {
  return fetch(`${HOST}${url}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function post(url: string, data: object) {
  return fetch(`${HOST}${url}`, {
    method: 'POST',
    body: Body.json(data),
  });
}
