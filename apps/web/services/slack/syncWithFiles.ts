import axios from 'axios';
import { findAccountById } from 'services/accounts';
import { SyncStatus, updateAndNotifySyncStatus } from 'services/accounts/sync';
import { SlackFileAdapter } from './file';
import { syncWrapper } from './syncWrapper';
import StreamZip from 'node-stream-zip';
import { tmpdir } from 'os';
import fs from 'fs';
import { v4 } from 'uuid';
import { Logger } from '@linen/types';

export async function slackSyncWithFiles({
  accountId,
  channelId,
  domain,
  fullSync,
  skipUsers = false,
  fileLocation,
  logger,
}: {
  accountId: string;
  channelId?: string;
  domain?: string;
  fullSync?: boolean | undefined;
  skipUsers?: boolean;
  fileLocation?: string;
  logger: Logger;
}) {
  logger.log({ startAt: new Date(), fullSync });

  if (!fileLocation) throw 'missing files location';

  const account = await findAccountById(accountId);

  if (!account) {
    throw { status: 404, error: 'Account not found' };
  }

  const file = await getFileFromS3(fileLocation);
  const tempFolder = await extractIntoTemp(file);

  const {
    fetchConversationsTyped,
    fetchReplies,
    fetchTeamInfo,
    getSlackChannels,
    joinChannel,
    listUsers,
    getMemberships,
  } = new SlackFileAdapter(tempFolder);

  await updateAndNotifySyncStatus({
    accountId,
    status: SyncStatus.IN_PROGRESS,
    accountName: account.name,
    homeUrl: account.homeUrl,
    communityUrl: account.communityUrl,
    pathDomain: account.slackDomain,
  });

  try {
    await syncWrapper({
      account,
      domain,
      accountId,
      channelId,
      skipUsers,
      fullSync,
      fetchConversationsTyped,
      fetchReplies,
      fetchTeamInfo,
      getSlackChannels,
      joinChannel,
      listUsers,
      getMemberships,
      logger,
    });

    await updateAndNotifySyncStatus({
      accountId,
      status: SyncStatus.DONE,
      accountName: account.name,
      homeUrl: account.homeUrl,
      communityUrl: account.communityUrl,
      pathDomain: account.slackDomain,
    });

    return {
      status: 200,
      body: {},
    };
  } catch (err) {
    logger.error({ err });

    await updateAndNotifySyncStatus({
      accountId,
      status: SyncStatus.ERROR,
      accountName: account.name,
      homeUrl: account.homeUrl,
      communityUrl: account.communityUrl,
      pathDomain: account.slackDomain,
    });

    throw {
      status: 500,
      error: String(err),
    };
  } finally {
    logger.log({ 'sync finished at': new Date() });
  }
}

async function getFileFromS3(fileLocation: string) {
  return new Promise(async (res, rej) => {
    try {
      const target = tmpdir() + '/' + v4();
      fs.mkdirSync(target, { recursive: true });
      const response = await axios({
        url: encodeURI(fileLocation),
        method: 'get',
        responseType: 'stream',
      });
      response.data.pipe(fs.createWriteStream(target + '/file.zip'));
      response.data.on('end', () => {
        res(target + '/file.zip');
      });
    } catch (error) {
      rej(error);
    }
  });
}

async function extractIntoTemp(file: any) {
  const target = tmpdir() + '/' + v4();
  const zip = new StreamZip.async({ file });
  fs.mkdirSync(target, { recursive: true });
  await zip.extract(null, target);
  await zip.close();
  return target;
}
