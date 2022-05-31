import { capitalize } from 'lib/util';
import {
  faSpinner,
  faCircleCheck,
  faCircleExclamation,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { SettingsProps, WaitForIntegration } from '..';
import { Dispatch, Fragment, SetStateAction, useRef, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { toast } from 'components/Toast';

function SynchronizerModal({
  open,
  setOpen,
  onSubmit,
}: {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  onSubmit: () => void;
}) {
  function onProceed() {
    setOpen(false);
    return onSubmit();
  }

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={setOpen}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end sm:items-center justify-center min-h-full p-4 text-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <div className="relative bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:max-w-lg sm:w-full sm:p-6">
                <div>
                  <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100">
                    <FontAwesomeIcon
                      icon={faCircleExclamation}
                      className="h-6 w-6 text-blue-500"
                      aria-hidden="true"
                    />
                  </div>
                  <div className="mt-3 text-center sm:mt-5">
                    <Dialog.Title
                      as="h3"
                      className="text-lg leading-6 font-medium text-gray-900"
                    >
                      Synchronize historic conversation
                    </Dialog.Title>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Lorem ipsum, dolor sit amet consectetur adipisicing
                        elit.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                  <button
                    type="button"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:col-start-2 sm:text-sm"
                    onClick={() => onProceed()}
                  >
                    Proceed
                  </button>
                  <button
                    type="button"
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:col-start-1 sm:text-sm"
                    onClick={() => setOpen(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}

export default function CommunitySynchronization({ account }: SettingsProps) {
  const [open, setOpen] = useState(false);

  const communityType =
    account && account.communityType ? account.communityType : 'Slack/Discord';

  async function onSubmit() {
    try {
      if (!account?.id) {
        throw 'missing account id';
      }
      const syncRequest = await fetch('/api/sync?account_id=' + account.id, {
        method: 'GET',
      });
      if (syncRequest.ok) {
        return toast.success('Synchronization started');
      }
      throw syncRequest;
    } catch (error) {
      return toast.error('Something went wrong');
    }
  }

  const statusMap: any = {
    NOT_STARTED: (
      <>
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm font-medium rounded-md text-white bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-300 sm:text-sm"
        >
          Synchronize
        </button>
      </>
    ),
    IN_PROGRESS: (
      <>
        <FontAwesomeIcon icon={faSpinner} className="h-5 w-5 mr-2" /> In
        progress
      </>
    ),
    DONE: (
      <>
        <FontAwesomeIcon
          icon={faCircleCheck}
          color="green"
          className="h-5 w-5 mr-2"
        />
        Done
      </>
    ),
    ERROR: (
      <>
        <FontAwesomeIcon
          icon={faCircleExclamation}
          className="h-5 w-5 mr-2"
          color="red"
        />{' '}
        Error
      </>
    ),
  };

  return (
    <div className="bg-white shadow sm:rounded-lg">
      <SynchronizerModal open={open} setOpen={setOpen} onSubmit={onSubmit} />
      <div className="px-4 py-5 sm:p-6">
        <div className="flex">
          <div className="grow">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              {capitalize(communityType)} historic conversation
            </h3>
            <div className="mt-2 sm:flex sm:items-start sm:justify-between">
              <div className="max-w-xl text-sm text-gray-500">
                <p>
                  Pull past {capitalize(communityType)} conversations in to
                  Linen.
                </p>
              </div>
            </div>
          </div>
          <div className="self-center">
            {account?.hasAuth ? (
              <div className="flex items-center">
                {account?.slackSyncStatus && statusMap[account.slackSyncStatus]}
              </div>
            ) : (
              <WaitForIntegration />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
