export const buildURL = (url: string, params?: any) => {
  if (!params) {
    return url;
  }
  const parameters = Object.keys(params).map(
    (key: string) => `${key}=${encodeURIComponent(params[key])}`
  );
  if (parameters.length === 0) {
    return url;
  }
  return `${url}?${parameters.join('&')}`;
};

export async function post(url = '', params = {}) {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  });
  return response.json();
}

export async function put(url = '', params = {}) {
  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  });
  return response.json();
}

export async function get(url = '', params = {}) {
  const response = await fetch(buildURL(url, params));
  return response.json();
}

export async function bulk({
  callback,
  next,
}: {
  callback(): Promise<any>;
  next(data: any): boolean;
}): Promise<void> {
  const data = await callback();
  if (next(data)) {
    return bulk({ callback, next });
  }
  return Promise.resolve();
}
