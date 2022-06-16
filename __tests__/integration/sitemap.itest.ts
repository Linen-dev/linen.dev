import {
  createXMLSitemapForSubdomain,
  createXMLSitemapForFreeCommunity,
} from '../../utilities/sitemap';

describe('createXMLSitemapForSubdomain', () => {
  let sitemap: string;
  beforeAll(async () => {
    sitemap = await createXMLSitemapForSubdomain('empty.dev');
  });

  it('it should create a sitemap without any hidden channel neither threads', async () => {
    expect(sitemap).toMatch(/^((?!hidden).)*$/);
  });
  it('it should create a sitemap with all pages of the channel', async () => {
    expect(sitemap).toMatch(/https:\/\/empty.dev\/c\/general\/10/);
    expect(sitemap).toMatch(/https:\/\/empty.dev\/c\/general\/1/);
  });
  it('it should only show threads with more than one message', async () => {
    expect(sitemap).toMatch(
      /https:\/\/empty.dev\/t\/([0-9]+)\/slug-general-([\w]{8}(-[\w]{4}){3}-[\w]{12})-0/
    );
    expect(sitemap).toMatch(
      /https:\/\/empty.dev\/t\/([0-9]+)\/slug-general-([\w]{8}(-[\w]{4}){3}-[\w]{12})-99/
    );
  });
});

describe('createXMLSitemapForFreeCommunity', () => {
  let sitemap: string;
  beforeAll(async () => {
    sitemap = await createXMLSitemapForFreeCommunity('linen.dev', 'empty');
  });
  it('it should create a sitemap without any hidden channel neither threads', async () => {
    expect(sitemap).toMatch(/^((?!hidden).)*$/);
  });
  it('it should create a sitemap with all pages of the channel', async () => {
    expect(sitemap).toMatch(/https:\/\/linen.dev\/s\/empty\/c\/general\/10/);
    expect(sitemap).toMatch(/https:\/\/linen.dev\/s\/empty\/c\/general\/1/);
  });
  it('it should only show threads with more than one message', async () => {
    expect(sitemap).toMatch(
      /https:\/\/linen.dev\/s\/empty\/t\/([0-9]+)\/slug-general-([\w]{8}(-[\w]{4}){3}-[\w]{12})-0/
    );
    expect(sitemap).toMatch(
      /https:\/\/linen.dev\/s\/empty\/t\/([0-9]+)\/slug-general-([\w]{8}(-[\w]{4}){3}-[\w]{12})-99/
    );
  });
});
