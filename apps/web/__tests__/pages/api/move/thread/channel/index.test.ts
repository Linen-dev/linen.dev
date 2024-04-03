/**
 * @jest-environment node
 */

import * as api from 'pages/api/move/thread/channel';
import { create } from '@linen/factory';
import { build } from '@linen/factory-client';

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

  it('returns 401 when user does not have permissions to manage', async () => {
    const community = await create('account');
    const user = await create('user', { accountsId: community.id });
    const permissions = build('permissions', { manage: false, user });
    const channel1 = await create('channel', { accountId: community.id });
    const channel2 = await create('channel', { accountId: community.id });
    const thread = await create('thread', { channelId: channel1.id });
    await create('message', {
      threadId: thread.id,
      channelId: channel1.id,
    });
    const { status } = await api.create({
      threadId: thread.id,
      channelId: channel2.id,
      communityId: community.id,
      permissions,
    });
    expect(status).toEqual(401);
  });

  it('returns 401 when the user is not an owner', async () => {
    const community = await create('account');
    const user = await create('user', { accountsId: community.id });
    const permissions = build('permissions', { manage: false, user });
    const channel1 = await create('channel', { accountId: community.id });
    const channel2 = await create('channel', { accountId: community.id });
    const thread = await create('thread', { channelId: channel1.id });
    await create('message', {
      threadId: thread.id,
      channelId: channel1.id,
    });
    const { status } = await api.create({
      threadId: thread.id,
      channelId: channel2.id,
      communityId: community.id,
      permissions,
    });
    expect(status).toEqual(401);
  });

  it('returns 200 when thread is moved to the channel by an admin', async () => {
    const community = await create('account');
    const user = await create('user', { accountsId: community.id });
    const permissions = build('permissions', { manage: true, user });
    const channel1 = await create('channel', { accountId: community.id });
    const channel2 = await create('channel', { accountId: community.id });
    const thread = await create('thread', { channelId: channel1.id });
    await create('message', {
      threadId: thread.id,
      channelId: channel1.id,
    });
    const { status } = await api.create({
      threadId: thread.id,
      channelId: channel2.id,
      communityId: community.id,
      permissions,
    });
    expect(status).toEqual(200);
  });

  it('returns 200 when thread is moved to the channel by an owner', async () => {
    const community = await create('account');
    const user = await create('user', { accountsId: community.id });
    const permissions = build('permissions', { manage: false, user });
    const channel1 = await create('channel', { accountId: community.id });
    const channel2 = await create('channel', { accountId: community.id });
    const thread = await create('thread', { channelId: channel1.id });
    await create('message', {
      usersId: user.id,
      threadId: thread.id,
      channelId: channel1.id,
    });
    const { status } = await api.create({
      threadId: thread.id,
      channelId: channel2.id,
      communityId: community.id,
      permissions,
    });
    expect(status).toEqual(200);
  });
});
