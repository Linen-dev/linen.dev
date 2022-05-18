import React from 'react';
import { NextPageContext } from 'next';
import { getSession, useSession } from 'next-auth/react';
import DashboardLayout from 'components/layout/DashboardLayout';
import { findAccountByEmail } from '../../../lib/models';
import Vercel, { DNSRecord, VercelError } from '../../../services/vercel';

interface Props {
  records?: DNSRecord[];
  error?: VercelError;
}

export default function ChannelsPage({ records, error }: Props) {
  const { data: session } = useSession();

  if (error) {
    return (
      <DashboardLayout header="DNS">
        <h1>Error</h1>
        <p>{error.message}</p>
      </DashboardLayout>
    );
  }

  if (!records || records.length === 0) {
    return (
      <DashboardLayout header="DNS">
        <h1>No DNS records found.</h1>
      </DashboardLayout>
    );
  }

  if (session) {
    return (
      <DashboardLayout header="DNS">
        {records.map((record: any) => (
          <p>{record.type}</p>
        ))}
      </DashboardLayout>
    );
  }
  return (
    <DashboardLayout header="DNS">
      <h1>You are not signed in.</h1>
    </DashboardLayout>
  );
}

export async function getServerSideProps(context: NextPageContext) {
  const session = await getSession(context);
  const account = await findAccountByEmail(session?.user?.email);

  if (!account) {
    return {
      redirect: {
        permanent: false,
        destination: 'signup/CreateAccountForm',
      },
    };
  }

  if (!account.redirectDomain) {
    return {
      props: {
        session,
      },
    };
  }

  const response = await Vercel.getDnsRecords(account.redirectDomain);

  if (response.error) {
    return {
      props: {
        error: response.error,
      },
    };
  }

  return {
    props: {
      session,
      records: response?.records || [],
    },
  };
}
