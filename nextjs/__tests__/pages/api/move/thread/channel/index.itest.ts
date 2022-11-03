import * as api from 'pages/api/move/thread/channel';
import { build, create } from '__tests__/factory';

describe('create', () => {
  it('returns 400 when threadId is missing', async () => {
    const permissions = build('permissions', { manage: true });
    const { status } = await api.create({
      threadId: '',
      channelId: '1',
      communityId: '1',
      permissions,
    });
    expect(status).toEqual(400);
  });

  it('returns 400 when channelId is missing', async () => {
    const permissions = build('permissions', { manage: true });
    const { status } = await api.create({
      threadId: '1',
      channelId: '',
      communityId: '1',
      permissions,
    });
    expect(status).toEqual(400);
  });

  it('returns 404 when community does not exist', async () => {
    const permissions = build('permissions', { manage: true });
    const { status } = await api.create({
      threadId: '1',
      channelId: '1',
      communityId: '1',
      permissions,
    });
    expect(status).toEqual(404);
  });

  it('returns 403 when channel does not exist', async () => {
    const permissions = build('permissions', { manage: true });
    const community = await create('account');
    const { status } = await api.create({
      threadId: '1',
      channelId: '1',
      communityId: community.id,
      permissions,
    });
    expect(status).toEqual(403);
  });

  it('returns 403 when thread does not exist', async () => {
    const permissions = build('permissions', { manage: true });
    const community = await create('account');
    const channel = await create('channel', { accountId: community.id });
    const { status } = await api.create({
      threadId: '1',
      channelId: channel.id,
      communityId: community.id,
      permissions,
    });
    expect(status).toEqual(403);
  });

  it('returns 403 when thread is from a different community', async () => {
    const permissions = build('permissions', { manage: true });
    const community1 = await create('account');
    const community2 = await create('account');
    const channel1 = await create('channel', { accountId: community1.id });
    const channel2 = await create('channel', { accountId: community2.id });
    const thread = await create('thread', { channelId: channel1.id });
    const { status } = await api.create({
      threadId: thread.id,
      channelId: channel2.id,
      communityId: community1.id,
      permissions,
    });
    expect(status).toEqual(403);
  });

  it('returns 200 when thread can be moved to the channel', async () => {
    const permissions = build('permissions', { manage: true });
    const community = await create('account');
    const channel1 = await create('channel', { accountId: community.id });
    const channel2 = await create('channel', { accountId: community.id });
    const thread = await create('thread', { channelId: channel1.id });
    const { status } = await api.create({
      threadId: thread.id,
      channelId: channel2.id,
      communityId: community.id,
      permissions,
    });
    expect(status).toEqual(200);
  });
});
