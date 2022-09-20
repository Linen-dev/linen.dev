import { captureException } from '@sentry/nextjs';
import NativeSelect from 'components/NativeSelect';
import { toast } from 'components/Toast';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { isTenantPickerEnabled } from 'utilities/featureFlags';

export interface Tenant {
  userId: string;
  role: string;
  accountId: string;
  accountName: string;
}

export interface UserSession {
  email: string;
  emailVerified: Date;
  id: string;
  accountId: string;
  tenants: Tenant[];
}

export function Tenant() {
  const { status, data } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);

  async function onChange(e: any) {
    e?.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('/api/tenant', {
        method: 'PUT',
        body: JSON.stringify({ tenant: e.target.value }),
      });
      if (!response.ok) {
        throw response;
      }
      router.reload();
    } catch (error) {
      captureException(error);
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  if (status !== 'authenticated') return <></>;

  return !!isTenantPickerEnabled ? (
    <div className="px-4 py-2">
      <div className="fixed bottom-0 text-[12px] flex flex-col">
        <span className="cursor-pointer" onClick={() => setShow(!show)}>
          {show ? 'hide' : 'show'} session
        </span>
        {show && (
          <pre className="bg-black text-white">
            {JSON.stringify({ status, data }, null, 1)}
          </pre>
        )}
      </div>
      <NativeSelect
        id="tenant"
        options={(data.user as UserSession)?.tenants?.map((tenant: any) => {
          return {
            label: tenant.accountName + ' as ' + tenant.role,
            value: tenant.accountId,
          };
        })}
        disabled={loading}
        defaultValue={(data.user as UserSession)?.accountId}
        onChange={onChange}
      />
    </div>
  ) : (
    <></>
  );
}
