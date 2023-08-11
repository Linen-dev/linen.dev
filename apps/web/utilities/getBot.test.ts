import { isBot } from './getBot';

describe('getBot', () => {
  test('isBot', () => {
    expect(
      isBot(
        'Mozilla/5.0 (compatible; DataForSeoBot/1.0; +https://dataforseo.com/dataforseo-bot)'
      )
    ).toBe(true);
    expect(isBot('Apache-HttpClient/5.2.1 (Java/17.0.2)')).toBe(true);
    expect(
      isBot('Mozilla/5.0 (compatible; YandexBot/3.0; +http://yandex.com/bots)')
    ).toBe(true);
    expect(
      isBot(
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/600.2.5 (KHTML, like Gecko) Version/8.0.2 Safari/600.2.5 (Amazonbot/0.1; +https://developer.amazon.com/support/amazonbot)'
      )
    ).toBe(true);
    expect(
      isBot(
        'Mozilla/5.0 (compatible; SiteAuditBot/0.97; +http://www.semrush.com/bot.html)'
      )
    ).toBe(true);
    expect(
      isBot(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36'
      )
    ).toBe(false);
    expect(
      isBot(
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36'
      )
    ).toBe(false);
    expect(
      isBot(
        'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36'
      )
    ).toBe(false);
    expect(
      isBot(
        'Mozilla/5.0 (X11; U; Linux i686; en-US; rv:1.7.10) Gecko/20050719 Red Hat/1.0.6-1.4.1 Firefox/1.0.6'
      )
    ).toBe(false);
    expect(
      isBot(
        'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1'
      )
    ).toBe(false);
  });
});
