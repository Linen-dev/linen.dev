import { create } from 'pages/api/merge';
import { create as factory } from '__tests__/factory';
import setup from '__tests__/spec-helpers/integration';

setup({ truncationStrategy: 'delete' });

describe('create', () => {
  it('returns 400 if from param is empty', async () => {
    const { status } = await create({ from: '', to: '1', communityId: '1' });
    expect(status).toEqual(400);
  });

  it('returns 400 if to param is empty', async () => {
    const { status } = await create({ from: '1', to: '', communityId: '1' });
    expect(status).toEqual(400);
  });

  it('returns 404 for an unknown community', async () => {
    const { status } = await create({ from: '1', to: '1', communityId: '1' });
    expect(status).toEqual(404);
  });

  it('returns 404 if from thread is not found', async () => {
    const community = await factory('account');
    const channel = await factory('channel', { accountId: community.id });
    const thread = await factory('thread', { channelId: channel.id });
    const { status } = await create({
      from: '1',
      to: thread.id,
      communityId: community.id,
    });
    expect(status).toEqual(404);
  });

  it('returns 404 if to thread is not found', async () => {
    const community = await factory('account');
    const channel = await factory('channel', { accountId: community.id });
    const thread = await factory('thread', { channelId: channel.id });
    const { status } = await create({
      from: thread.id,
      to: '1',
      communityId: community.id,
    });
    expect(status).toEqual(404);
  });

  it('returns 403 if threads are from different communities', async () => {
    const community1 = await factory('account');
    const community2 = await factory('account');
    const channel1 = await factory('channel', { accountId: community1.id });
    const channel2 = await factory('channel', { accountId: community2.id });
    const thread1 = await factory('thread', { channelId: channel1.id });
    const thread2 = await factory('thread', { channelId: channel2.id });
    const { status } = await create({
      from: thread1.id,
      to: thread2.id,
      communityId: community1.id,
    });
    expect(status).toEqual(403);
  });

  it('returns 200 and merges threads from the same channel', async () => {
    const community = await factory('account');
    const channel = await factory('channel', { accountId: community.id });
    const thread1 = await factory('thread', { channelId: channel.id });
    const thread2 = await factory('thread', { channelId: channel.id });
    const { status } = await create({
      from: thread1.id,
      to: thread2.id,
      communityId: community.id,
    });
    expect(status).toEqual(200);
  });

  it('returns 200 and merges threads from different channel', async () => {
    const community = await factory('account');
    const channel1 = await factory('channel', { accountId: community.id });
    const channel2 = await factory('channel', { accountId: community.id });
    const thread1 = await factory('thread', { channelId: channel1.id });
    const thread2 = await factory('thread', { channelId: channel2.id });
    const { status } = await create({
      from: thread1.id,
      to: thread2.id,
      communityId: community.id,
    });
    expect(status).toEqual(200);
  });
});
