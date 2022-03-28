//Todos: Probably want to strip @ channel @ here later
//remove the, if, of, for etc words
export const createSlug = (message: string) => {
  let slug = message
    .replace(/[^A-Za-z0-9\s]/g, ' ')
    .replace(/[^\w\s$*_+~.()'"!\-:@]+/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .substring(0, 60);
  if (slug === '') {
    return 'conversation';
  }
  return slug;
};

export const tsToSentAt = (ts: string) => {
  return new Date(parseFloat(ts) * 1000);
};

// TODO: Should handle this on validation/save when creating an account
export const addHttpsToUrl = (url: string) => {
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return `https://${url}`;
  }
  return url;
};

// Checks if the routing is subdomain or based on paths
export const isSubdomainbasedRouting = (host: string): boolean => {
  if (host.includes('vercel.app')) {
    return false;
  }

  if (host.includes('.')) {
    if (host.split('.')[0] === 'www') {
      return false;
    }
    if (host.includes('localhost:3000')) {
      return true;
    }

    // handle osquery.fleetdm.com and something.linen.dev
    if (host.split('.').length > 2) {
      return true;
    }
  }

  return false;
};
