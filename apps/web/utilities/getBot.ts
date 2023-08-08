export function getBot(input: string): string | undefined {
  const result =
    /Googlebot|Mediapartners-Google|Bytespider|Chrome-Lighthouse|HubSpot Crawler|Amazonbot|MJ12bot|DotBot|SemrushBot|Barkrowler|SeznamBot|YouBot|HeadlessChrome|CensysInspect|DuckDuckGo-Favicons-Bot|FeedlyApp|InternetMeasurement|Grammarly|MojeekBot|ZoominfoBot|Embedly|PetalBot|AhrefsBot|AdsBot-Google|googleweblight|Storebot-Google|Google-PageRenderer|Google-InspectionTool|Bingbot|BingPreview|Slurp|DuckDuckBot|baiduspider|yandex|sogou|LinkedInBot|bitlybot|tumblr|vkShare|quora link preview|facebookexternalhit|facebookcatalog|Twitterbot|applebot|redditbot|Slackbot|Discordbot|WhatsApp|SkypeUriPreview|ia_archiver/i.exec(
      input
    );
  return result?.length ? result.at(0) : undefined;
}

export function isBot(userAgent: string) {
  return !!getBot(userAgent);
}
