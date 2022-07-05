import React from 'react';
import { NextPageContext } from 'next';
import { getSession, useSession } from 'next-auth/react';
import DashboardLayout from 'components/layout/DashboardLayout';
import Table, { Thead, Tbody, Th, Td } from 'components/Table';
import { findAccountByEmail } from '../../../lib/models';
import Vercel, { DNSRecord, VercelError } from '../../../services/vercel';
import serializeAccount, { SerializedAccount } from 'serializers/account';

interface Props {
  account?: SerializedAccount;
  records?: DNSRecord[];
  error?: VercelError;
}

export default function ChannelsPage({ account, records, error }: Props) {
  const { data: session } = useSession();

  if (error) {
    return (
      <DashboardLayout header="DNS" account={account}>
        <p>{error.message}</p>
      </DashboardLayout>
    );
  }

  if (!records || records.length === 0) {
    return (
      <DashboardLayout header="DNS" account={account}>
        <h1>No DNS records found.</h1>
      </DashboardLayout>
    );
  }

  if (session) {
    return (
      <DashboardLayout header="DNS" account={account}>
        <p className="mb-6 text-sm">
          Subdomain routing setup can be achieved by veryfing the ownership of a
          domain. Copy the TXT and/or CNAME records from below and paste them
          into your DNS settings.
        </p>
        <h2 className="text-md font-bold">Records</h2>
        <Table>
          <Thead>
            <tr>
              <Th>Type</Th>
              <Th>Name</Th>
              <Th>Value</Th>
            </tr>
          </Thead>
          <Tbody>
            {records.map((record: DNSRecord, index) => (
              <tr key={record.type + index}>
                <Td>{record.type}</Td>
                <Td>{record.name}</Td>
                <Td>{record.value}</Td>
              </tr>
            ))}
          </Tbody>
        </Table>
      </DashboardLayout>
    );
  }
  return (
    <DashboardLayout header="DNS" account={account}>
      <h1>You are not signed in.</h1>
    </DashboardLayout>
  );
}

export async function getServerSideProps(context: NextPageContext) {
  const session = await getSession(context);
  const account = await findAccountByEmail(session?.user?.email);

  if (!session) {
    return {
      redirect: {
        permanent: false,
        destination: '../signin',
      },
    };
  }
  if (!account || !account.premium) {
    return {
      redirect: {
        permanent: false,
        destination: '../settings',
      },
    };
  }

  if (!account.redirectDomain) {
    return {
      props: {
        account: serializeAccount(account),
      },
    };
  }

  const response = await Vercel.findOrCreateDomainWithDnsRecords(
    account.redirectDomain
  );

  return {
    props: {
      account: serializeAccount(account),
      ...response,
    },
  };
}
