import { SerializedMessage, SerializedThread } from 'serializers/thread';
import { Settings } from 'services/accountSettings';
import { buildChannelSeo, buildThreadSeo } from './seo';

describe('buildChannelSeo', () => {
  const defaultProps = {
    isSubDomainRouting: true,
    pathCursor: '',
    channelName: 'channelName',
    threads: [] as SerializedThread[],
    settings: {
      communityName: 'communityName',
      redirectDomain: 'redirectDomain',
      logoUrl: 'image.png',
      prefix: 'd',
    } as Settings,
  };
  test('minimum', async () => {
    const { description, title, url, image, ...rest } = await buildChannelSeo(
      defaultProps
    );
    expect(title).toEqual('CommunityName | ChannelName');
    expect(description).toEqual(title);
    expect(url).toEqual('https://redirectDomain/c/channelName');
    expect(image).toEqual(defaultProps.settings.logoUrl);
    expect(rest).toEqual({});
  });
  test('premium with threads', async () => {
    const { description, title, url, image, ...rest } = await buildChannelSeo({
      ...defaultProps,
      threads: [
        {
          messages: [
            {
              body: 'body',
            },
          ],
        },
        {
          messages: [
            {
              body: 'body',
            },
          ],
        },
        {
          messages: [
            {
              body: 'body',
            },
          ],
        },
      ] as SerializedThread[],
    });
    expect(title).toEqual('CommunityName | ChannelName');
    expect(description).toEqual('body ... body ... body');
    expect(url).toEqual('https://redirectDomain/c/channelName');
    expect(image).toEqual(defaultProps.settings.logoUrl);
    expect(rest).toEqual({});
  });
  test('premium with threads with attach', async () => {
    const { description, title, url, image, ...rest } = await buildChannelSeo({
      ...defaultProps,
      threads: [
        {
          slug: 'topic',
          messages: [
            {
              body: '',
            },
          ],
        },
        {
          slug: 'conversation',
          messages: [
            {
              body: '',
            },
          ],
        },
        {
          slug: 'slug slug',
          messages: [
            {
              body: '',
            },
          ],
        },
      ] as SerializedThread[],
    });
    expect(title).toEqual('CommunityName | ChannelName');
    expect(description).toEqual('topic ... conversation ... slug slug');
    expect(url).toEqual('https://redirectDomain/c/channelName');
    expect(image).toEqual(defaultProps.settings.logoUrl);
    expect(rest).toEqual({});
  });
  test('free community', async () => {
    const { description, title, url, image, ...rest } = await buildChannelSeo({
      ...defaultProps,
      isSubDomainRouting: false,
    });
    expect(title).toEqual('CommunityName | ChannelName');
    expect(description).toEqual(title);
    expect(url).toEqual('https://linen.dev/d/communityName/c/channelName');
    expect(image).toEqual(defaultProps.settings.logoUrl);
    expect(rest).toEqual({});
  });
  test('free slack community', async () => {
    const { description, title, url, image, ...rest } = await buildChannelSeo({
      ...defaultProps,
      isSubDomainRouting: false,
      settings: {
        ...defaultProps.settings,
        prefix: 's',
      },
    });
    expect(title).toEqual('CommunityName | ChannelName');
    expect(description).toEqual(title);
    expect(url).toEqual('https://linen.dev/s/communityName/c/channelName');
    expect(image).toEqual(defaultProps.settings.logoUrl);
    expect(rest).toEqual({});
  });
  test('channel with cursor', async () => {
    const { description, title, url, image, ...rest } = await buildChannelSeo({
      ...defaultProps,
      pathCursor: 'cursor',
    });
    expect(title).toEqual('CommunityName | ChannelName | cursor');
    expect(description).toEqual(title);
    expect(url).toEqual('https://redirectDomain/c/channelName/cursor');
    expect(image).toEqual(defaultProps.settings.logoUrl);
    expect(rest).toEqual({});
  });
});

describe('buildThreadSeo', () => {
  const defaultProps = {
    isSubDomainRouting: true,
    threadId: '123',
    channelName: 'channelName',
    slug: 'slug-cool',
    messages: [],
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
    expect(title).toEqual('slug cool | ChannelName | CommunityName');
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
    expect(title).toEqual('slug cool | ChannelName | CommunityName');
    expect(description).toEqual('slug cool');
    expect(url).toEqual('https://linen.dev/d/communityName/t/123/slug-cool');
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
    expect(title).toEqual('slug cool | ChannelName | CommunityName');
    expect(description).toEqual('slug cool');
    expect(url).toEqual('https://linen.dev/s/communityName/t/123/slug-cool');
    expect(image).toEqual(defaultProps.settings.logoUrl);
    expect(rest).toEqual({});
  });

  test('message on title', async () => {
    const { description, title, url, image, ...rest } = await buildThreadSeo({
      ...defaultProps,
      isSubDomainRouting: false,
      messages: [
        {
          body: 'message     on     the       body',
        } as SerializedMessage,
      ],
      settings: {
        ...defaultProps.settings,
        prefix: 's',
      },
    });
    expect(title).toEqual('message on the body | ChannelName | CommunityName');
    expect(description).toEqual('message on the body');
    expect(url).toEqual('https://linen.dev/s/communityName/t/123/slug-cool');
    expect(image).toEqual(defaultProps.settings.logoUrl);
    expect(rest).toEqual({});
  });

  test('capitalized slug', async () => {
    const { description, title, url, image, ...rest } = await buildThreadSeo({
      ...defaultProps,
      isSubDomainRouting: false,
      slug: 'Slug-COOL',
      settings: {
        ...defaultProps.settings,
        prefix: 's',
      },
    });
    expect(title).toEqual('Slug COOL | ChannelName | CommunityName');
    expect(description).toEqual('Slug COOL');
    expect(url).toEqual('https://linen.dev/s/communityName/t/123/slug-cool');
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
      messages: [
        {
          body: `this is a loo ${ooo(150)} ong message`,
        } as SerializedMessage,
      ],
      settings: {
        ...defaultProps.settings,
        prefix: 's',
      },
    });
    expect(title).toEqual(
      `this is a loo ${ooo(11)} oo | ChannelName | CommunityName`
    );
    expect(description).toEqual(`this is a loo ${ooo(46)} oo`);
    expect(url).toEqual('https://linen.dev/s/communityName/t/123/slug-cool');
    expect(image).toEqual(defaultProps.settings.logoUrl);
    expect(rest).toEqual({});
  });
});
