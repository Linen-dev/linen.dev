import { useEffect, useState } from 'react';
import PageLayout from 'components/layout/PageLayout';
import Header from './Header';
import { Button, NativeSelect, TextInput, Toast } from '@linen/ui';
import { useRouter } from 'next/router';
import { Roles } from '@prisma/client';
import { AiOutlineUser } from 'react-icons/ai';
import {
  SerializedAccount,
  SerializedChannel,
  Settings,
  Permissions,
} from '@linen/types';

interface Props {
  channels: SerializedChannel[];
  communities: SerializedAccount[];
  currentCommunity: SerializedAccount;
  settings: Settings;
  permissions: Permissions;
  isSubDomainRouting: boolean;
}

export interface MembersType {
  id: string;
  email: string | null;
  role: Roles;
  status: 'PENDING' | 'ACCEPTED' | 'UNKNOWN' | string;
}

function InviteMember({
  onSubmit,
  loading,
}: {
  onSubmit: any;
  loading: boolean;
}) {
  return (
    <div>
      <form onSubmit={onSubmit} className="flex flex-row gap-2">
        <div className="grow">
          <TextInput
            id="email"
            placeholder="Invite by email"
            type="email"
            required
          />
        </div>
        <div className="shrink">
          <NativeSelect
            id="role"
            icon={<AiOutlineUser />}
            theme="blue"
            options={[
              { label: 'Member', value: Roles.MEMBER },
              { label: 'Admin', value: Roles.ADMIN },
            ]}
          />
        </div>
        <div className="shrink">
          <Button block type="submit" disabled={loading}>
            {loading ? 'Loading...' : 'Invite member'}
          </Button>
        </div>
      </form>
    </div>
  );
}

function MemberStatus({ status }: { status: string }) {
  if (status === 'PENDING')
    return (
      <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
        {status}
      </p>
    );
  if (status === 'ACCEPTED')
    return (
      <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
        {status}
      </p>
    );
  return (
    <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-grey-100 text-grey-800">
      {status}
    </p>
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
            label="Filters"
            placeholder="Filter by Email"
            {...{
              onKeyUp: filterByEmail,
            }}
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
      const response = await fetch(url, {
        method: 'PUT',
        body: JSON.stringify({ userId: id, inviteId: id, role, communityId }),
      });
      if (!response.ok) {
        throw response;
      }
      setData({ ...data, role });
    } catch (error) {
      Toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <li key={user.id} className="mb-1">
      <div className="border-gray-200 border-solid border rounded-md">
        <div className="flex justify-start items-center p-4">
          <p className="grow text-sm font-medium truncate">{user.email}</p>
          <div className="flex pr-4">
            <NativeSelect
              id={user.id}
              value={data.role}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                onChange(e, user.status)
              }
              disabled={loading}
              icon={<AiOutlineUser />}
              theme="blue"
              options={[
                { label: 'Member', value: Roles.MEMBER },
                { label: 'Admin', value: Roles.ADMIN },
                { label: 'Owner', value: Roles.OWNER },
              ]}
            />
          </div>
          <div className="flex items-center">
            <MemberStatus status={user.status} />
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
      if (!response.ok) {
        throw response;
      } else {
        router.reload();
      }
    } catch (error) {
      Toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageLayout
      channels={channels}
      communities={communities}
      settings={settings}
      permissions={permissions}
      isSubDomainRouting={isSubDomainRouting}
      className="w-full"
    >
      <Header />
      <div className="p-3">
        <InviteMember onSubmit={createInvite} loading={loading} />
        <TableMembers users={users} communityId={currentCommunity.id} />
      </div>
    </PageLayout>
  );
}
