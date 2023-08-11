const botList = [
  'AdsBot-Google',
  'AhrefsBot',
  'Amazonbot',
  'Apache-HttpClient',
  'applebot',
  'baiduspider',
  'Barkrowler',
  'bingbot',
  'Bingbot',
  'BingPreview',
  'bitlybot',
  'Bytespider',
  'CensysInspect',
  'Chrome-Lighthouse',
  'DataForSeoBot',
  'Discordbot',
  'DotBot',
  'DuckDuckBot',
  'DuckDuckGo-Favicons-Bot',
  'Embedly',
  'facebookcatalog',
  'facebookexternalhit',
  'FeedlyApp',
  'Google-InspectionTool',
  'Google-PageRenderer',
  'Googlebot',
  'googleweblight',
  'Grammarly',
  'HeadlessChrome',
  'HubSpot Crawler',
  'ia_archiver',
  'InternetMeasurement',
  'LinkedInBot',
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
  'Twitterbot',
  'VelenPublicWebCrawler',
  'vkShare',
  'WhatsApp',
  'yandex',
  'YandexBot',
  'YouBot',
  'ZoominfoBot',
];

const regex = new RegExp(botList.join('|'), 'i');

export function getBot(input: string): string | undefined {
  const result = regex.exec(input);
  return result?.length ? result.at(0) : undefined;
}

export function isBot(userAgent: string) {
  return !!getBot(userAgent);
}
