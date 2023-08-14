const knownBot = [
  'AdsBot-Google',
  'Amazonbot',
  'AhrefsBot',
  'applebot',
  'bingbot',
  'Bingbot',
  'BingPreview',
  'Chrome-Lighthouse',
  'DuckDuckBot',
  'DuckDuckGo-Favicons-Bot',
  'facebookcatalog',
  'facebookexternalhit',
  'Google-InspectionTool',
  'Google-PageRenderer',
  'Googlebot',
  'googleweblight',
  'LinkedInBot',
  'Twitterbot',
  'yandex',
  'YandexBot',
];

const botList = [
  'Apache-HttpClient',
  'baiduspider',
  'Barkrowler',
  'bitlybot',
  'Bytespider',
  'curl',
  'CensysInspect',
  'DataForSeoBot',
  'Discordbot',
  'DotBot',
  'Embedly',
  'FeedlyApp',
  'Grammarly',
  'HeadlessChrome',
  'HubSpot Crawler',
  'ia_archiver',
  'InternetMeasurement',
  'Mediapartners-Google',
  'MJ12bot',
  'MojeekBot',
  'PetalBot',
  'quora link preview',
  'redditbot',
  'SemrushBot',
  'SeznamBot',
  'SiteAuditBot',
  'SkypeUriPreview',
  'Slackbot',
  'Slurp',
  'sogou',
  'Storebot-Google',
  'tumblr',
  'VelenPublicWebCrawler',
  'vkShare',
  'WhatsApp',
  'YouBot',
  'ZoominfoBot',
];

const regex = new RegExp([...knownBot, ...botList].join('|'), 'i');

export function getBot(input: string): string | undefined {
  const result = regex.exec(input);
  return result?.length ? result.at(0) : undefined;
}

export function isBot(userAgent: string) {
  return !!getBot(userAgent);
}

const regexBadBots = new RegExp([...botList].join('|'), 'i');

export function isBadBot(userAgent: string | null) {
  if (!userAgent) {
    return true;
  }
  const result = regexBadBots.exec(userAgent);
  return !!(result?.length ? result.at(0) : undefined);
}
