import React, { useEffect, useState } from 'react';
import Header from './Header';
import Avatar from '@/Avatar';
import Badge from '@/Badge';
import Button from '@/Button';
import Label from '@/Label';
import NativeSelect from '@/NativeSelect';
import TextInput from '@/TextInput';
import Toast from '@/Toast';
import { Roles, SerializedAccount } from '@linen/types';
import { FiUser } from '@react-icons/all-files/fi/FiUser';
import { FiTrash2 } from '@react-icons/all-files/fi/FiTrash2';
import { FiSend } from '@react-icons/all-files/fi/FiSend';
import { FiPaperclip } from '@react-icons/all-files/fi/FiPaperclip';
import styles from './index.module.scss';
import ConfirmationModal from '@/ConfirmationModal';
import type { ApiClient } from '@linen/api-client';
import classNames from 'classnames';
import { isEmailValid } from '@linen/utilities/email';
import Tabs from '@/Tabs';
import { copyToClipboard } from '@linen/utilities/clipboard';

interface MembersType {
  id: string;
  email: string | null;
  role: Roles;
  status: 'PENDING' | 'ACCEPTED' | 'UNKNOWN' | string;
  displayName: string | null;
  profileImageUrl: string | null;
}

enum Tab {
  Email = 'email',
  Link = 'link',
}

function InviteMember({
  onSubmit,
  loading,
}: {
  onSubmit: any;
  loading: boolean;
}) {
  return (
    <>
      <form className={styles.form} onSubmit={onSubmit}>
        <Label htmlFor="email">
          Invite
          <br />
          <span className={styles.subtitle}>
            Send invitations via email. You can enter multiple emails, comma
            separated.
          </span>
        </Label>
        <div className={styles.flexRowGap2}>
          <div className={styles.grow}>
            <TextInput
              id="email"
              type="text"
              icon={<FiUser />}
              placeholder="user1@domain.com,user2@domain.com"
              required
            />
          </div>
          <div className={styles.shrink}>
            <NativeSelect
              id="role"
              icon={<FiUser />}
              theme="blue"
              options={[
                { label: 'Member', value: Roles.MEMBER },
                { label: 'Admin', value: Roles.ADMIN },
              ]}
            />
          </div>
          <div className={styles.shrink}>
            <Button type="submit" disabled={loading}>
              <FiSend />
              {loading ? 'Loading...' : 'Send'}
            </Button>
          </div>
        </div>
      </form>
    </>
  );
}

function TableMembers({
  users,
  onChangeMember,
  onDeleteMember,
}: {
  users: MembersType[];
  onChangeMember: (id: string, role: string, status: string) => Promise<void>;
  onDeleteMember: (user: MembersType) => Promise<void>;
}) {
  function filterByEmail(e: any) {
    const filter = e.target.value.toLowerCase();
    const ul = document.getElementById('memberList');
    if (!ul) return;
    const li = ul.getElementsByTagName('li');
    if (!li) return;
    for (let i = 0; i < li.length; i++) {
      let p = li[i].getElementsByTagName('p')[0];
      if (p) {
        let txtValue = p.textContent || p.innerText;
        if (txtValue.toLowerCase().indexOf(filter) > -1) {
          li[i].style.display = '';
        } else {
          li[i].style.display = 'none';
        }
      }
    }
  }

  return (
    <>
      <div className={styles.flexPt4}>
        <div className={styles.growMb2}>
          <TextInput
            id="filterByEmail"
            label="Search"
            onKeyUp={filterByEmail}
          />
        </div>
      </div>
      <ul role="list" id="memberList" className={styles.flexColGap0}>
        {users?.map((user) => (
          <RowMember
            user={user}
            onChangeMember={onChangeMember}
            onDeleteMember={onDeleteMember}
            key={user.id}
          />
        ))}
      </ul>
    </>
  );
}

function RowMember({
  user,
  onChangeMember,
  onDeleteMember,
}: {
  user: MembersType;
  onChangeMember: (id: string, role: string, status: string) => Promise<void>;
  onDeleteMember: (user: MembersType) => Promise<void>;
}): JSX.Element {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(user);
  const [modal, setModal] = useState(false);

  async function onChange(e: any) {
    setLoading(true);
    const role = e.target.value;
    const id = e.target.id;
    await onChangeMember(id, role, user.status);
    setData({ ...data, role });
    setLoading(false);
  }

  return (
    <li key={user.id} className={styles.mb2}>
      <div className={styles.border}>
        <div className={styles.userWrapper}>
          <Avatar src={user.profileImageUrl} text={user.displayName} />
          <p className={styles.userDetails}>
            {user.displayName}
            {user.status === 'PENDING' && (
              <Badge
                className={classNames({
                  [styles.ml1]: !!user.displayName,
                })}
                type="info"
              >
                Pending
              </Badge>
            )}
            <br />
            <span className={styles.userEmail}>{user.email}</span>
          </p>
          <div className={styles.grow} />
          <div>
            <NativeSelect
              id={user.id}
              value={data.role}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                onChange(e);
              }}
              disabled={loading}
              icon={<FiUser />}
              theme="white"
              options={[
                { label: 'Member', value: Roles.MEMBER },
                { label: 'Admin', value: Roles.ADMIN },
                { label: 'Owner', value: Roles.OWNER },
              ]}
            />
          </div>
          <div className={styles.itemsCenter}>
            {user.role !== Roles.OWNER ? (
              <>
                {modal && (
                  <ConfirmationModal
                    title="Remove user"
                    description="Please confirm to remove the user"
                    confirm="Remove"
                    open={modal}
                    close={() => {
                      setModal(false);
                    }}
                    onConfirm={() => {
                      onDeleteMember(user);
                      setModal(false);
                    }}
                  />
                )}
                <FiTrash2
                  onClick={() => setModal(true)}
                  className={styles.cursorPointer}
                />
              </>
            ) : (
              <div className={styles.w4} />
            )}
          </div>
        </div>
      </div>
    </li>
  );
}

export default function MembersView({
  currentCommunity,
  routerReload,
  api,
}: {
  currentCommunity: SerializedAccount;
  routerReload(): void;
  api: ApiClient;
}) {
  const [users, setUsers] = useState<MembersType[]>([]);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState(Tab.Email);
  const tabs = [
    {
      header: 'Invite by email',
      id: Tab.Email,
      active: tab === Tab.Email,
      onClick() {
        setTab(Tab.Email);
      },
    },
    {
      header: 'Invite by link',
      id: Tab.Link,
      active: tab === Tab.Link,
      onClick() {
        setTab(Tab.Link);
      },
    },
  ];

  useEffect(() => {
    let mounted = true;
    api
      .getMembers({ communityId: currentCommunity.id })
      .then((response: any) => {
        if (response && response.users) {
          setUsers(response.users);
        }
      });
    return () => {
      mounted = false;
    };
  }, []);

  const createInvite = async (event: any) => {
    event.preventDefault();
    setLoading(true);
    try {
      const form = event.target;
      const emails = form.email.value.split(',');
      const role = form.role.value;
      const existingEmails = users.map((user) => user.email);
      const usedEmails = emails.filter((email: string) =>
        existingEmails.includes(email)
      );

      if (usedEmails.length > 0) {
        return Toast.error(
          `Provided ${
            usedEmails.length === 1 ? 'email is' : 'emails are'
          } already used: ${usedEmails.join(', ')}`
        );
      }

      if (!isEmailValid(emails.join(','))) {
        return Toast.error('Please enter a valid email');
      }

      await api.createInvite({
        email: emails.join(','),
        role,
        communityId: currentCommunity.id,
      });
      routerReload();
    } catch (exception) {
      Toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const onChangeMember = async (id: string, role: any, status: string) => {
    try {
      if (status === 'ACCEPTED') {
        await api.updateUserRole({
          userId: id,
          role,
          accountId: currentCommunity.id,
        });
      } else {
        await api.updateInvite({
          inviteId: id,
          role,
          communityId: currentCommunity.id,
        });
      }
    } catch (error) {
      Toast.error('Something went wrong');
    }
  };

  const onDeleteMember = async (user: MembersType) => {
    await api
      .deleteUser({
        userId: user.id,
        accountId: currentCommunity.id,
      })
      .then((_) => {
        routerReload();
      });
  };

  function getShareUrl() {
    const url =
      process.env.NODE_ENV === 'development'
        ? 'http://localhost:3000'
        : 'https://www.linen.dev';
    return `${url}/invite/${
      currentCommunity.slackDomain ||
      currentCommunity.discordDomain ||
      currentCommunity.discordServerId
    }`;
  }

  function onShare() {
    const url = getShareUrl();
    copyToClipboard(url);
    Toast.success('Copied to clipboard');
  }

  return (
    <div className={styles.container}>
      <Header />
      <div className={styles.content}>
        <Tabs items={tabs} />
        {tab === Tab.Email && (
          <>
            <InviteMember onSubmit={createInvite} loading={loading} />
            <TableMembers
              users={users}
              onChangeMember={onChangeMember}
              onDeleteMember={onDeleteMember}
            />
          </>
        )}
        {tab === Tab.Link && (
          <>
            <TextInput
              className={styles.input}
              id="community-invite-url"
              type="text"
              defaultValue={getShareUrl()}
              readOnly
            />
            <Button onClick={onShare}>
              <FiPaperclip />
              Copy the link
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
