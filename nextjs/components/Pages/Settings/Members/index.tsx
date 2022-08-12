import TextInput from 'components/TextInput';
import { MembersPageProps } from 'pages/settings/members';
import DashboardLayout from 'components/layout/DashboardLayout';
import Button from 'components/Button';
import { useRouter } from 'next/router';

export interface MembersType {
  email: string;
  role: 'Admin';
  status: 'PENDING' | 'ACCEPTED' | 'UNKNOWN' | string;
}

function InviteMember({ onSubmit }: { onSubmit: any }) {
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
          <Button block type="submit">
            Invite member
          </Button>
        </div>
      </form>
      <p className="mt-2 text-xs text-gray-500" id="email-description">
        New member will be added to the team as Admin.
      </p>
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
        {users?.map((user) => (
          <li key={user.email}>
            <div className="border-gray-200 border-solid border">
              <div className="flex justify-start items-center p-4">
                <p className="grow text-sm font-medium truncate">
                  {user.email}
                  <span className="flex text-xs text-gray-500">
                    {user.role}
                  </span>
                </p>
                {/* <div className="text-sm mr-4">
                  {user.status === 'PENDING' && (
                    <a href="#" className="text-blue-700 hover:text-blue-800">
                      Resend invitation
                    </a>
                  )}
                </div> */}
                <div className="flex items-center">
                  <MemberStatus status={user.status} />
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Members({ account, users }: MembersPageProps) {
  const router = useRouter();

  async function createInvite(event: any) {
    event.preventDefault();
    const form = event.target;
    const email = form.email.value;
    const response = await fetch('/api/invites', {
      method: 'POST',
      body: JSON.stringify({ email, accountId: account?.id }),
    });
    if (!response.ok) {
      alert('Something went wrong');
    } else {
      router.reload();
    }
  }

  return (
    <DashboardLayout header="Members" account={account!}>
      <InviteMember onSubmit={createInvite} />
      <TableMembers users={users} />
    </DashboardLayout>
  );
}
