import React, { Fragment, useEffect, useState } from 'react';
import { Transition } from '@headlessui/react';
import { GetOneInviteByUserType } from 'services/invites';
import { useRouter } from 'next/router';

export function Invite() {
  const [show, setShow] = useState(false);
  const [invite, setInvite] = useState<GetOneInviteByUserType | null>();
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const getInvite = async (): Promise<GetOneInviteByUserType> => {
    const response = await fetch('/api/invites');
    if (!response.ok) throw response.text();
    return response.json();
  };

  const acceptInvite = async (): Promise<any> => {
    if (!invite?.id) return;
    const response = await fetch('/api/invites', {
      method: 'PUT',
      body: JSON.stringify({ id: invite?.id }),
    });
    if (!response.ok) throw response.text();
    return response.json();
  };

  useEffect(() => {
    getInvite().then((res) => {
      res && setInvite(res);
      res && setShow(true);
    });
  }, []);

  function createdByDisplayName(): string {
    return (
      invite?.createdBy?.displayName ||
      invite?.createdBy?.auth?.email ||
      'An admin'
    );
  }

  function accountName(): string {
    return (
      invite?.accounts?.name ||
      invite?.accounts?.slackDomain ||
      invite?.accounts?.discordDomain ||
      ''
    );
  }

  const handlerJoin = async () => {
    setLoading(true);
    acceptInvite()
      .then((e) => {
        setInvite(null);
        handlerClose();
      })
      .catch((e) => alert('Something went wrong'))
      .finally(() => {
        setLoading(false);
        router.reload();
      });
  };

  const handlerClose = () => {
    setShow(false);
  };

  return (
    <>
      <div
        aria-live="assertive"
        className="fixed inset-0 flex items-end px-4 py-6 pointer-events-none sm:p-6 sm:items-start"
      >
        <div className="w-full flex flex-col items-center space-y-4 sm:items-end">
          <Transition
            show={show}
            as={Fragment}
            enter="transform ease-out duration-300 transition"
            enterFrom="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
            enterTo="translate-y-0 opacity-100 sm:translate-x-0"
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="max-w-sm w-full bg-white shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden">
              <div className="p-4">
                <div className="flex items-start">
                  <div className="ml-3 w-0 flex-1 pt-0.5">
                    <p className="text-sm font-medium text-gray-900">
                      {createdByDisplayName()} invited you to join your team{' '}
                      {accountName()}
                    </p>
                    <p className="mt-1 text-sm text-gray-500">
                      Join your team {accountName()} on Linen.dev and start
                      collaborating.
                    </p>
                    <div className="mt-3 flex space-x-7">
                      <button
                        onClick={handlerJoin}
                        disabled={loading}
                        type="button"
                        className="bg-white rounded-md text-sm font-medium text-blue-600 hover:text-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        {loading ? 'Joining...' : 'Join'}
                      </button>
                      <button
                        type="button"
                        className="bg-white rounded-md text-sm font-medium text-gray-700 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        onClick={handlerClose}
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                  <div className="ml-4 flex-shrink-0 flex">
                    <button
                      type="button"
                      className="bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      onClick={handlerClose}
                    >
                      <span className="sr-only">Close</span>X
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </Transition>
        </div>
      </div>
    </>
  );
}
