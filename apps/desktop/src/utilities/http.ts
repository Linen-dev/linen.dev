import { fetch, Body } from '@tauri-apps/api/http';
const HOST = 'http://localhost:3000';
// const HOST = 'https://linen.dev';

function Http() {
  let token = '';

  function setToken(newToken) {
    token = newToken;
  }

  function get(url: string): Promise<any> {
    return fetch(`${HOST}${url}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  function post(url: string, data: object) {
    return fetch(`${HOST}${url}`, {
      method: 'POST',
      body: Body.json(data),
    });
  }

  return {
    get,
    post,
    setToken,
  };
}
const http = Http();

export const get = http.get;
export const post = http.post;
export const setToken = http.setToken;
