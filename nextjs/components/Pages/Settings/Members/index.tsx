import TextInput from 'components/TextInput';
import { MembersPageProps } from 'pages/settings/members';
import DashboardLayout from 'components/layout/DashboardLayout';
import Button from 'components/Button';
import { useRouter } from 'next/router';
import { useState } from 'react';
import NativeSelect from 'components/NativeSelect';
import { Roles } from '@prisma/client';
import { captureException } from '@sentry/nextjs';
import { toast } from 'components/Toast';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

export interface MembersType {
  id: string;
  email: string;
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
            options={[
              { label: Roles.MEMBER, value: Roles.MEMBER },
              { label: Roles.ADMIN, value: Roles.ADMIN },
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

function TableMembers({ users }: { users: MembersType[] }) {
  return (
    <div>
      <ul role="list" className="flex flex-col pt-4 gap-0">
        {users?.map((user) => RowMember(user))}
      </ul>
    </div>
  );
}

function RowMember(user: MembersType): JSX.Element {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(user);

  const onChange = async (e: any, status: string) => {
    e?.preventDefault();
    setLoading(true);
    try {
      const role = e.target.value;
      const userId = e.target.id;
      let url = '/api/invites';
      if (status === 'ACCEPTED') {
        url = '/api/users';
      }
      const response = await fetch(url, {
        method: 'PUT',
        body: JSON.stringify({ userId, role }),
      });
      if (!response.ok) {
        throw response;
      }
      setData({ ...data, role });
    } catch (error) {
      captureException(error);
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <li key={user.id}>
      <div className="border-gray-200 border-solid border">
        <div className="flex justify-start items-center p-4">
          <p className="grow text-sm font-medium truncate">{user.email}</p>
          <div className="flex pr-4">
            {loading && (
              <div className="relative z-10 left-1/2 right-1/2 pt-2">
                <FontAwesomeIcon
                  icon={faSpinner}
                  spin
                  className="h-5 w-5 text-blue-400 "
                />
              </div>
            )}
            <NativeSelect
              id={user.id}
              defaultValue={data.role}
              onChange={(e) => onChange(e, user.status)}
              disabled={loading}
              options={[
                { label: Roles.MEMBER, value: Roles.MEMBER },
                { label: Roles.ADMIN, value: Roles.ADMIN },
                { label: Roles.OWNER, value: Roles.OWNER },
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

export default function Members({ account, users }: MembersPageProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function createInvite(event: any) {
    event.preventDefault();
    setLoading(true);
    try {
      const form = event.target;
      const email = form.email.value;
      const role = form.role.value;
      const response = await fetch('/api/invites', {
        method: 'POST',
        body: JSON.stringify({ email, accountId: account?.id, role }),
      });
      if (!response.ok) {
        throw response;
      } else {
        router.reload();
      }
    } catch (error) {
      captureException(error);
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <DashboardLayout header="Members" account={account!}>
      <InviteMember onSubmit={createInvite} loading={loading} />
      <TableMembers users={users} />
    </DashboardLayout>
  );
}
