import * as db from '@linen/database';
import { MessageFormat, messages } from './messages';
import { ThreadState, threads } from './threads';
import {
  ChannelOrderBy,
  ChannelType,
  ChannelViewType,
  channels,
  channelsIntegrationType,
} from './channels';
import {
  AccountIntegration,
  AccountType,
  AnonymizeType,
  ChatType,
  accounts,
} from './accounts';
import { Roles } from './roles';
import { notificationType } from './notification';
import { mentions } from './mentions';
import { messageAttachments } from './messageAttachments';
import { messageReactions } from './messageReactions';
import { slackAuthorizations } from './slackAuthorizations';
import { users } from './users';
import { userThreadStatus } from './userThreadStatus';

describe('check enums', () => {
  test('MessageFormat', () => {
    expect(Object.entries(db.MessageFormat)).toStrictEqual(
      Object.entries(MessageFormat)
    );
  });
  test('ThreadState', () => {
    expect(Object.entries(db.ThreadState)).toStrictEqual(
      Object.entries(ThreadState)
    );
  });
  test('ChannelViewType', () => {
    expect(Object.entries(db.ChannelViewType)).toStrictEqual(
      Object.entries(ChannelViewType)
    );
  });
  test('ChannelType', () => {
    expect(Object.entries(db.ChannelType)).toStrictEqual(
      Object.entries(ChannelType)
    );
  });
  test('ChannelOrderBy', () => {
    expect(Object.entries(db.ChannelOrderBy)).toStrictEqual(
      Object.entries(ChannelOrderBy)
    );
  });
  test('channelsIntegrationType', () => {
    expect(Object.entries(db.channelsIntegrationType)).toStrictEqual(
      Object.entries(channelsIntegrationType)
    );
  });
  test('AnonymizeType', () => {
    expect(Object.entries(db.AnonymizeType)).toStrictEqual(
      Object.entries(AnonymizeType)
    );
  });
  test('AccountType', () => {
    expect(Object.entries(db.AccountType)).toStrictEqual(
      Object.entries(AccountType)
    );
  });
  test('AccountIntegration', () => {
    expect(Object.entries(db.AccountIntegration)).toStrictEqual(
      Object.entries(AccountIntegration)
    );
  });
  test('ChatType', () => {
    expect(Object.entries(db.ChatType)).toStrictEqual(Object.entries(ChatType));
  });
  test('Roles', () => {
    expect(Object.entries(db.Roles)).toStrictEqual(Object.entries(Roles));
  });
  test('notificationType', () => {
    expect(Object.entries(db.notificationType)).toStrictEqual(
      Object.entries(notificationType)
    );
  });
});

type Expect<T extends true> = T;
type Equal<X, Y> = (<T>() => T extends X ? 1 : 2) extends <T>() => T extends Y
  ? 1
  : 2
  ? true
  : false;

describe('check models', () => {
  test('accounts', () => {
    type a = Expect<Equal<accounts, db.accounts>>;
  });
  test('channels', () => {
    type a = Expect<Equal<channels, db.channels>>;
  });
  test('mentions', () => {
    type a = Expect<Equal<mentions, db.mentions>>;
  });
  test('messageAttachments', () => {
    type a = Expect<Equal<messageAttachments, db.messageAttachments>>;
  });
  test('messageReactions', () => {
    type a = Expect<Equal<messageReactions, db.messageReactions>>;
  });
  test('messages', () => {
    type a = Expect<Equal<messages, db.messages>>;
  });
  test('slackAuthorizations', () => {
    type a = Expect<Equal<slackAuthorizations, db.slackAuthorizations>>;
  });
  test('threads', () => {
    type a = Expect<Equal<threads, db.threads>>;
  });
  test('users', () => {
    type a = Expect<Equal<users, db.users>>;
  });
  test('userThreadStatus', () => {
    type a = Expect<Equal<userThreadStatus, db.userThreadStatus>>;
  });
});
