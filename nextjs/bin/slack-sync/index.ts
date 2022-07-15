import {
  findArgAndParse,
  findArgAndParseOrThrow,
} from '../../utilities/processArgs';
import { slackSync } from '../../services/slack';

(async () => {
  const accountId = findArgAndParseOrThrow('accountId');
  const channelId = findArgAndParse('channelId');
  const domain = findArgAndParse('domain');
  await slackSync({
    accountId,
    channelId,
    domain,
  });
})();
