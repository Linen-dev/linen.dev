import Link from 'next/link';
import { Button, Toast } from '@linen/ui';
import { useState } from 'react';

type Account = {
  id: string;
  name: string;
  domain: string;
};

const shouldLog = process.env.NODE_ENV === 'development';

const Or = <div className="p-4 text-sm text-gray-400 text-center"> or </div>;
const Space = <div className="p-4"></div>;

function NotFoundPage({...rest}) {
  const [accounts] = useState<Account[]>(rest.accounts);
  const [freeCommunities] = useState<Account[]>([
    {
      domain: 'linen',
      id: 'id',
      name: 'Linen',
    },
  ]);
  async function openTenant(communityId: string, redirectTo: string) {
    try {
      const tenant = await fetch('/api/tenants', {
        method: 'POST',
        body: JSON.stringify({
          communityId,
        }),
      });

      if (!tenant.ok) {
        throw tenant;
      }

      window.location.href = redirectTo;
    } catch (error) {
      if (shouldLog) {
        console.error({ error });
      }
      return Toast.error('Something went wrong');
    }
  }
  return (
    <>
      <div className="bg-white min-h-full px-4 py-16 sm:px-6 sm:py-24 md:grid md:place-items-center lg:px-8">
        <div className="max-w-max mx-auto">
          <main className="sm:flex">
            <p className="text-4xl font-extrabold text-indigo-600 sm:text-5xl">
              404
            </p>
            <div className="sm:ml-6">
              <div className="sm:border-l sm:border-gray-200 sm:pl-6">
                <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight sm:text-5xl">
                  Page not found
                </h1>
                <p className="mt-1 text-base text-gray-500">
                  Please check the URL in the address bar and try again.
                </p>
              </div>
              {!!freeCommunities?.length && (
                <>
                  {Or}
                  <div className="flex flex-col gap-2">
                    <h1 className="font-bold">Visit our free community</h1>
                    <div className="flex flex-col gap-2 divide-y divide-solid divide-gray-200">
                      {freeCommunities.map((account: Account) => (
                        <div className="flex items-center" key={account.id}>
                          <div className="flex flex-col grow">
                            {account.name || account.id}
                            <span className="text-sm text-gray-500">{`linen.dev/s/${account.domain}`}</span>
                          </div>
                          <Button
                            className="-mb-2"
                            onClick={() =>
                              (window.location.href = `/s/${account.domain}`)
                            }
                          >
                            Open
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
              {!!accounts?.length && (
          <>
            {Space}
            <div className="flex flex-col gap-2">
              <h1 className="font-bold">Open a community</h1>
              <div className="flex flex-col gap-2 divide-y divide-solid divide-gray-200">
                {accounts.map((account: Account) => (
                  <div className="flex items-center" key={account.id}>
                    <div className="flex flex-col grow">
                      {account.name || account.id}
                      <span className="text-sm text-gray-500">{`linen.dev/s/${account.domain}`}</span>
                    </div>
                    <Button
                      className="-mb-2"
                      onClick={() =>
                        openTenant(account.id, `/s/${account.domain}`)
                      }
                    >
                      Open
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
              <div className="mt-10 flex space-x-3 sm:border-l sm:border-transparent sm:pl-6">
                <Link
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  href="/"
                  passHref
                >
                  Go back home
                </Link>
                <a
                  href="mailto:help@linen.dev?subject=Thread%20not%20found"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Contact support
                </a>
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}

export default NotFoundPage;
