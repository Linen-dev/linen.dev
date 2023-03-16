import { SerializedThread } from '@linen/types';
import { Settings } from '@linen/types';
import { buildChannelSeo } from './buildChannelSeo';

describe('buildChannelSeo', () => {
  const defaultProps = {
    isSubDomainRouting: true,
    currentChannel: { channelName: 'channelName' },
    threads: [] as SerializedThread[],
    settings: {
      communityName: 'communityName',
      redirectDomain: 'redirectDomain',
      logoUrl: 'image.png',
      prefix: 'd',
    } as Settings,
    currentCommunity: { description: 'hi' },
  };
  test('minimum', async () => {
    const { description, title, url, image, ...rest } = await buildChannelSeo(
      defaultProps
    );
    expect(title).toEqual('communityName #channelName');
    expect(description).toEqual('hi communityName #channelName');
    expect(url).toEqual('https://redirectDomain/c/channelName');
    expect(image).toEqual(defaultProps.settings.logoUrl);
    expect(rest).toEqual({});
  });

  test('free community', async () => {
    const { description, title, url, image, ...rest } = await buildChannelSeo({
      ...defaultProps,
      isSubDomainRouting: false,
    });
    expect(title).toEqual('communityName #channelName');
    expect(description).toEqual('hi communityName #channelName');
    expect(url).toEqual('https://www.linen.dev/d/communityName/c/channelName');
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
    expect(title).toEqual('communityName #channelName');
    expect(description).toEqual('hi communityName #channelName');
    expect(url).toEqual('https://www.linen.dev/s/communityName/c/channelName');
    expect(image).toEqual(defaultProps.settings.logoUrl);
    expect(rest).toEqual({});
  });

  test('channel with cursor', async () => {
    const { description, title, url, image, ...rest } = await buildChannelSeo({
      ...defaultProps,
      page: 1,
    });
    expect(title).toEqual('communityName #channelName Page 1');
    expect(description).toEqual('hi communityName #channelName Page 1');
    expect(url).toEqual('https://redirectDomain/c/channelName/1');
    expect(image).toEqual(defaultProps.settings.logoUrl);
    expect(rest).toEqual({});
  });
});
