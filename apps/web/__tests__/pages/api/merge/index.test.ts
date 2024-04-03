/**
 * @jest-environment node
 */

import * as api from 'pages/api/merge';
import { create } from '@linen/factory';
import { build } from '@linen/factory-client';

describe('create', () => {
  it('returns 400 if from param is empty', async () => {
    const permissions = build('permissions', { manage: true });
    const { status } = await api.create({
      from: '',
      to: '1',
      permissions,
      communityId: '1',
    });
    expect(status).toEqual(400);
  });

  it('returns 400 if to param is empty', async () => {
    const permissions = build('permissions', { manage: true });
    const { status } = await api.create({
      from: '1',
      to: '',
      permissions,
      communityId: '1',
    });
    expect(status).toEqual(400);
  });

  it('returns 404 for an unknown community', async () => {
    const permissions = build('permissions', { manage: true });
    const { status } = await api.create({
      from: '1',
      to: '1',
      permissions,
      communityId: '1',
    });
    expect(status).toEqual(404);
  });

  it('returns 404 if from thread is not found', async () => {
    const permissions = build('permissions', { manage: true });
    const community = await create('account');
    const channel = await create('channel', { accountId: community.id });
    const thread = await create('thread', { channelId: channel.id });
    const { status } = await api.create({
      from: '1',
      to: thread.id,
      permissions,
      communityId: community.id,
    });
    expect(status).toEqual(404);
  });

  it('returns 404 if to thread is not found', async () => {
    const permissions = build('permissions', { manage: true });
    const community = await create('account');
    const channel = await create('channel', { accountId: community.id });
    const thread = await create('thread', { channelId: channel.id });
    const { status } = await api.create({
      from: thread.id,
      to: '1',
      permissions,
      communityId: community.id,
    });
    expect(status).toEqual(404);
  });

  it('returns 401 if the user does not have permissions to manage', async () => {
    const community = await create('account');
    const user1 = await create('user', { accountsId: community.id });
    const user2 = await create('user', { accountsId: community.id });
    const permissions = build('permissions', { manage: false, user: user1 });
    const channel = await create('channel', { accountId: community.id });
    const thread1 = await create('thread', { channelId: channel.id });
    const thread2 = await create('thread', { channelId: channel.id });
    await create('message', {
      threadId: thread1.id,
      channelId: channel.id,
      usersId: user2.id,
    });
    await create('message', {
      threadId: thread2.id,
      channelId: channel.id,
      usersId: user2.id,
    });
    const { status } = await api.create({
      from: thread1.id,
      to: thread2.id,
      permissions,
      communityId: community.id,
    });
    expect(status).toEqual(401);
  });

  it('returns 403 if threads are from different communities', async () => {
    const permissions = build('permissions', { manage: true });
    const community1 = await create('account');
    const community2 = await create('account');
    const channel1 = await create('channel', { accountId: community1.id });
    const channel2 = await create('channel', { accountId: community2.id });
    const thread1 = await create('thread', { channelId: channel1.id });
    const thread2 = await create('thread', { channelId: channel2.id });
    const { status } = await api.create({
      from: thread1.id,
      to: thread2.id,
      permissions,
      communityId: community1.id,
    });
    expect(status).toEqual(403);
  });

  it('returns 200 and merges threads from the same channel', async () => {
    const community = await create('account');
    const user = await create('user', { accountsId: community.id });
    const permissions = build('permissions', { manage: true, user });
    const channel = await create('channel', { accountId: community.id });
    const thread1 = await create('thread', { channelId: channel.id });
    const thread2 = await create('thread', { channelId: channel.id });
    await create('message', {
      threadId: thread1.id,
      channelId: channel.id,
      usersId: user.id,
    });
    await create('message', {
      threadId: thread2.id,
      channelId: channel.id,
      usersId: user.id,
    });
    const { status } = await api.create({
      from: thread1.id,
      to: thread2.id,
      permissions,
      communityId: community.id,
    });
    expect(status).toEqual(200);
  });

  it('returns 200 and merges threads from different channel', async () => {
    const community = await create('account');
    const user = await create('user', { accountsId: community.id });
    const permissions = build('permissions', { manage: true, user });
    const channel1 = await create('channel', { accountId: community.id });
    const channel2 = await create('channel', { accountId: community.id });
    const thread1 = await create('thread', { channelId: channel1.id });
    const thread2 = await create('thread', { channelId: channel2.id });
    await create('message', {
      threadId: thread1.id,
      channelId: channel1.id,
      usersId: user.id,
    });
    await create('message', {
      threadId: thread2.id,
      channelId: channel2.id,
      usersId: user.id,
    });
    const { status } = await api.create({
      from: thread1.id,
      to: thread2.id,
      permissions,
      communityId: community.id,
    });
    expect(status).toEqual(200);
  });

  it('returns 200 if the user owns the threads', async () => {
    const community = await create('account');
    const user = await create('user', { accountsId: community.id });
    const permissions = build('permissions', { manage: false, user });
    const channel = await create('channel', { accountId: community.id });
    const thread1 = await create('thread', { channelId: channel.id });
    const thread2 = await create('thread', { channelId: channel.id });
    await create('message', {
      threadId: thread1.id,
      channelId: channel.id,
      usersId: user.id,
    });
    await create('message', {
      threadId: thread2.id,
      channelId: channel.id,
      usersId: user.id,
    });
    const { status } = await api.create({
      from: thread1.id,
      to: thread2.id,
      permissions,
      communityId: community.id,
    });
    expect(status).toEqual(200);
  });
});
