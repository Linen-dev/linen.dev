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

export const pickTextColorBasedOnBgColor = (
  bgColor: string,
  lightColor: string,
  darkColor: string
) => {
  var color = bgColor.charAt(0) === '#' ? bgColor.substring(1, 7) : bgColor;
  var r = parseInt(color.substring(0, 2), 16); // hexToR
  var g = parseInt(color.substring(2, 4), 16); // hexToG
  var b = parseInt(color.substring(4, 6), 16); // hexToB
  var uicolors = [r / 255, g / 255, b / 255];
  var c = uicolors.map((col) => {
    if (col <= 0.03928) {
      return col / 12.92;
    }
    return Math.pow((col + 0.055) / 1.055, 2.4);
  });
  var L = 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  return L > 0.179 ? darkColor : lightColor;
};
