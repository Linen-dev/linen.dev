import { fetch } from '@tauri-apps/api/http';
const HOST = 'https://linen.dev';

export async function get(url: string): Promise<any> {
  return fetch(`${HOST}${url}`, {
    method: 'GET',
  });
}
