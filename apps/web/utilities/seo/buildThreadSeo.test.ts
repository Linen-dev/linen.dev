import { SerializedMessage } from '@linen/types';
import { Settings } from '@linen/types';
import { buildThreadSeo } from './buildThreadSeo';

describe('buildThreadSeo', () => {
  const defaultProps = {
    isSubDomainRouting: true,
    channelName: 'channelName',
    thread: { incrementId: '123', slug: 'slug-cool', messages: [] },
    settings: {
      communityName: 'communityName',
      redirectDomain: 'redirectDomain',
      logoUrl: 'image.png',
      prefix: 'd',
    } as Settings,
  };
  test('minimum', async () => {
    const { description, title, url, image, ...rest } = await buildThreadSeo(
      defaultProps
    );
    expect(title).toEqual('slug cool communityName #channelName');
    expect(description).toEqual('slug cool');
    expect(url).toEqual('https://redirectDomain/t/123/slug-cool');
    expect(image).toEqual(defaultProps.settings.logoUrl);
    expect(rest).toEqual({});
  });
  test('free community', async () => {
    const { description, title, url, image, ...rest } = await buildThreadSeo({
      ...defaultProps,
      isSubDomainRouting: false,
    });
    expect(title).toEqual('slug cool communityName #channelName');
    expect(description).toEqual('slug cool');
    expect(url).toEqual(
      'https://www.linen.dev/d/communityName/t/123/slug-cool'
    );
    expect(image).toEqual(defaultProps.settings.logoUrl);
    expect(rest).toEqual({});
  });
  test('free slack community', async () => {
    const { description, title, url, image, ...rest } = await buildThreadSeo({
      ...defaultProps,
      isSubDomainRouting: false,
      settings: {
        ...defaultProps.settings,
        prefix: 's',
      },
    });
    expect(title).toEqual('slug cool communityName #channelName');
    expect(description).toEqual('slug cool');
    expect(url).toEqual(
      'https://www.linen.dev/s/communityName/t/123/slug-cool'
    );
    expect(image).toEqual(defaultProps.settings.logoUrl);
    expect(rest).toEqual({});
  });

  test('message on title', async () => {
    const { description, title, url, image, ...rest } = await buildThreadSeo({
      ...defaultProps,
      isSubDomainRouting: false,
      thread: {
        ...defaultProps.thread,
        messages: [
          {
            body: 'message     on     the       body',
          } as SerializedMessage,
        ],
      },
      settings: {
        ...defaultProps.settings,
        prefix: 's',
      },
    });
    expect(title).toEqual('message on the body communityName #channelName');
    expect(description).toEqual('message on the body');
    expect(url).toEqual(
      'https://www.linen.dev/s/communityName/t/123/slug-cool'
    );
    expect(image).toEqual(defaultProps.settings.logoUrl);
    expect(rest).toEqual({});
  });

  test('thread with title', async () => {
    const { description, title, url, image, ...rest } = await buildThreadSeo({
      ...defaultProps,
      isSubDomainRouting: false,
      thread: {
        ...defaultProps.thread,
        title: 'well hello',
        messages: [
          {
            body: 'message     on     the       body',
          } as SerializedMessage,
        ],
      },
      settings: {
        ...defaultProps.settings,
        prefix: 's',
      },
    });
    expect(title).toEqual('well hello communityName #channelName');
    expect(description).toEqual('message on the body');
    expect(url).toEqual(
      'https://www.linen.dev/s/communityName/t/123/slug-cool'
    );
    expect(image).toEqual(defaultProps.settings.logoUrl);
    expect(rest).toEqual({});
  });

  test('capitalized slug', async () => {
    const { description, title, url, image, ...rest } = await buildThreadSeo({
      ...defaultProps,
      isSubDomainRouting: false,
      thread: {
        ...defaultProps.thread,
        slug: 'Slug-COOL',
      },
      settings: {
        ...defaultProps.settings,
        prefix: 's',
      },
    });
    expect(title).toEqual('Slug COOL communityName #channelName');
    expect(description).toEqual('Slug COOL');
    expect(url).toEqual(
      'https://www.linen.dev/s/communityName/t/123/slug-cool'
    );
    expect(image).toEqual(defaultProps.settings.logoUrl);
    expect(rest).toEqual({});
  });

  test('message too long', async () => {
    const ooo = (n: number) =>
      Array(n)
        .fill(0)
        .map((v, i) => 'ooo')
        .join(' ');

    const { description, title, url, image, ...rest } = await buildThreadSeo({
      ...defaultProps,
      isSubDomainRouting: false,
      thread: {
        ...defaultProps.thread,
        messages: [
          {
            body: `this is a loo ${ooo(150)} ong message`,
          } as SerializedMessage,
        ],
      },
      settings: {
        ...defaultProps.settings,
        prefix: 's',
      },
    });
    expect(title).toEqual(
      `this is a loo ${ooo(11)} oo communityName #channelName`
    );
    expect(description).toEqual(`this is a loo ${ooo(46)} oo`);
    expect(url).toEqual(
      'https://www.linen.dev/s/communityName/t/123/slug-cool'
    );
    expect(image).toEqual(defaultProps.settings.logoUrl);
    expect(rest).toEqual({});
  });
});
