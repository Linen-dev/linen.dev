import { useEffect, useState } from 'react';
import PageLayout from 'components/layout/PageLayout';
import Header from './Header';
import Avatar from '@linen/ui/Avatar';
import Badge from '@linen/ui/Badge';
import Button from '@linen/ui/Button';
import Label from '@linen/ui/Label';
import NativeSelect from '@linen/ui/NativeSelect';
import TextInput from '@linen/ui/TextInput';
import Toast from '@linen/ui/Toast';
import { useRouter } from 'next/router';
import { Roles } from '@linen/types';
import { FiUser } from '@react-icons/all-files/fi/FiUser';
import { FiTrash2 } from '@react-icons/all-files/fi/FiTrash2';
import { FiSend } from '@react-icons/all-files/fi/FiSend';
import styles from './index.module.scss';

import {
  SerializedAccount,
  SerializedChannel,
  Settings,
  Permissions,
} from '@linen/types';
import { api } from 'utilities/requests';
import ConfirmationModal from '@linen/ui/ConfirmationModal';

export interface Props {
  channels: SerializedChannel[];
  communities: SerializedAccount[];
  currentCommunity: SerializedAccount;
  settings: Settings;
  permissions: Permissions;
  isSubDomainRouting: boolean;
  dms: SerializedChannel[];
}

export interface MembersType {
  id: string;
  email: string | null;
  role: Roles;
  status: 'PENDING' | 'ACCEPTED' | 'UNKNOWN' | string;
  displayName: string | null;
  profileImageUrl: string | null;
}

function InviteMember({
  onSubmit,
  loading,
}: {
  onSubmit: any;
  loading: boolean;
}) {
  return (
    <form className={styles.form} onSubmit={onSubmit}>
      <Label htmlFor="email">
        Invite
        <br />
        <span className="text-xs font-normal text-gray-700 dark:text-gray-200">
          Send invitations via email. You can enter multiple emails, comma
          separated.
        </span>
      </Label>
      <div className="flex flex-row gap-2">
        <div className="grow">
          <TextInput
            id="email"
            type="text"
            icon={<FiUser />}
            placeholder="user1@domain.com,user2@domain.com"
            required
          />
        </div>
        <div className="shrink">
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
        <div className="shrink">
          <Button type="submit" disabled={loading}>
            <FiSend />
            {loading ? 'Loading...' : 'Send'}
          </Button>
        </div>
      </div>
    </form>
  );
}

function TableMembers({
  users,
  communityId,
}: {
  users: MembersType[];
  communityId: string;
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
      <div className="flex pt-4">
        <div className="grow mb-2">
          <TextInput
            id="filterByEmail"
            label="Search"
            onKeyUp={filterByEmail}
          />
        </div>
      </div>
      <ul role="list" id="memberList" className="flex flex-col gap-0">
        {users?.map((user) => RowMember(user, communityId))}
      </ul>
    </>
  );
}

function RowMember(user: MembersType, communityId: string): JSX.Element {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(user);
  const [modal, setModal] = useState(false);

  const onChange = async (e: any, status: string) => {
    e?.preventDefault();
    setLoading(true);
    try {
      const role = e.target.value;
      const id = e.target.id;
      let url = '/api/invites';
      if (status === 'ACCEPTED') {
        url = '/api/users';
      }
      await api.put(url, {
        userId: id,
        inviteId: id,
        role,
        communityId,
        accountId: communityId,
      });

      setData({ ...data, role });
    } catch (error) {
      Toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const onDeleteClick = async (user: MembersType) => {
    await api
      .deleteUser({
        userId: user.id,
        accountId: communityId,
      })
      .then((_) => {
        window.location.reload();
      });
  };

  return (
    <li key={user.id} className="mb-2">
      <div className="border-gray-100 dark:border-gray-700 border-solid border rounded-md">
        <div className="flex justify-start items-center px-2 py-2 gap-2">
          <Avatar src={user.profileImageUrl} text={user.displayName} />
          <p className="text-sm font-medium truncate">
            {user.displayName}
            {user.status === 'PENDING' && (
              <Badge className={user.displayName ? 'ml-1' : ''} type="info">
                Pending
              </Badge>
            )}
            <br />
            <span className="text-xs font-normal text-gray-700 dark:text-gray-200">
              {user.email}
            </span>
          </p>
          <div className="grow" />
          <div>
            <NativeSelect
              id={user.id}
              value={data.role}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                onChange(e, user.status)
              }
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
          <div className="items-center">
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
                      onDeleteClick(user);
                      setModal(false);
                    }}
                  />
                )}
                <FiTrash2
                  onClick={() => setModal(true)}
                  className="cursor-pointer"
                />
              </>
            ) : (
              <div className="w-4" />
            )}
          </div>
        </div>
      </div>
    </li>
  );
}

export default function Members({
  channels,
  communities,
  settings,
  permissions,
  currentCommunity,
  isSubDomainRouting,
  dms,
}: Props) {
  const [users, setUsers] = useState<MembersType[]>([]);
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    fetch(`/api/members?communityId=${currentCommunity.id}`)
      .then((response) => response.json())
      .then((response: any) => {
        if (response && response.users) {
          setUsers(response.users);
        }
      });
    return () => {
      mounted = false;
    };
  }, []);

  async function createInvite(event: any) {
    event.preventDefault();
    setLoading(true);
    try {
      const form = event.target;
      const email = form.email.value;
      const role = form.role.value;
      const response = await fetch('/api/invites', {
        method: 'POST',
        body: JSON.stringify({ email, communityId: currentCommunity.id, role }),
      });
      const data = await response.json();
      if (!response.ok) {
        if (data.error) {
          Toast.error(data.error);
        } else {
          throw response;
        }
      } else {
        router.reload();
      }
    } catch (exception) {
      Toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageLayout
      channels={channels}
      communities={communities}
      currentCommunity={currentCommunity}
      settings={settings}
      permissions={permissions}
      isSubDomainRouting={isSubDomainRouting}
      className="w-full"
      dms={dms}
    >
      <Header />
      <div className="p-3">
        <InviteMember onSubmit={createInvite} loading={loading} />
        <TableMembers users={users} communityId={currentCommunity.id} />
      </div>
    </PageLayout>
  );
}
