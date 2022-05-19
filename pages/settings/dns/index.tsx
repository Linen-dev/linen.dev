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
        <p className="mb-6 text-sm">
          Subdomain routing setup can be achieved by veryfing the ownership of a
          domain. Copy the TXT and CNAME records from below and paste them into
          your DNS settings.
        </p>
        <h2 className="text-md font-bold">Records</h2>
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full py-2 align-middle">
            <div className="overflow-hidden shadow-sm ring-1 ring-black ring-opacity-5">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6 lg:pl-8"
                    >
                      Type
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Name
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Value
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {records.map((record: DNSRecord, index) => (
                    <tr key={record.type + index}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6 lg:pl-8">
                        {record.type}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {record.name}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {record.value}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
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

  const records = response.records.filter(
    (record) => record.type === 'TXT' || record.type === 'CNAME'
  );

  return {
    props: {
      session,
      records: records,
    },
  };
}
