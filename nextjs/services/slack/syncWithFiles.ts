import axios from 'axios';
import { findAccountById } from 'lib/models';
import { SyncStatus, updateAndNotifySyncStatus } from 'services/sync';
import { SlackFileAdapter } from './file';
import { syncWrapper } from './syncWrapper';
import StreamZip from 'node-stream-zip';
import { tmpdir } from 'os';
import fs from 'fs';
import { v4 } from 'uuid';

export async function slackSyncWithFiles({
  accountId,
  channelId,
  domain,
  fullSync,
  skipUsers = false,
  fileLocation,
}: {
  accountId: string;
  channelId?: string;
  domain?: string;
  fullSync?: boolean | undefined;
  skipUsers?: boolean;
  fileLocation?: string;
}) {
  console.log(new Date(), { fullSync });

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

  await updateAndNotifySyncStatus(
    accountId,
    SyncStatus.IN_PROGRESS,
    account.name,
    account.homeUrl
  );

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
    });

    await updateAndNotifySyncStatus(
      accountId,
      SyncStatus.DONE,
      account.name,
      account.homeUrl
    );

    return {
      status: 200,
      body: {},
    };
  } catch (err) {
    console.error(err);

    await updateAndNotifySyncStatus(
      accountId,
      SyncStatus.ERROR,
      account.name,
      account.homeUrl
    );

    throw {
      status: 500,
      error: String(err),
    };
  } finally {
    console.log('sync finished at', new Date());
  }
}

async function getFileFromS3(fileLocation: string) {
  return new Promise(async (res, rej) => {
    try {
      const target = tmpdir() + '/' + v4();
      fs.mkdirSync(target, { recursive: true });
      const response = await axios({
        baseURL: fileLocation,
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
