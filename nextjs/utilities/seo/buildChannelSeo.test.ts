import { SerializedThread } from 'serializers/thread';
import { Settings } from 'services/accountSettings';
import { buildChannelSeo } from './buildChannelSeo';

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
