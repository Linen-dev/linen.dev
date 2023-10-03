import LangChain from './langchain';
import Linen from './linen';
import { join } from 'path';
import StringUtils from './utils/string';

async function run() {
  const communities = [
    {
      communityName: 'threads.netmaker.io',
      url: 'https://docs.netmaker.io',
      selectors: ['div.md-content'],
    },
    {
      communityName: 'discuss.flyte.org',
      url: 'https://docs.flyte.org',
      selectors: ['article[role="main"]'],
    },
  ];

  for (const record of communities) {
    const { url, communityName } = record;
    const community = await Linen.getCommunityInfo(communityName);
    await LangChain.crawlToStore({
      url,
      communityName: community.name,
      options: {
        selectors: record.selectors,
        output: join(__dirname, '../.db/crawl', StringUtils.clean(url)),
      },
    });
  }
}

run();
