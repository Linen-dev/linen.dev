import { Fragment, useState, createRef } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { FiPlus, FiX } from 'react-icons/fi';
import Button from 'components/Button';
import TextInput from 'components/TextInput';
import { captureException } from '@sentry/nextjs';
import { toast } from 'components/Toast';
import { useSession } from 'next-auth/react';
import { useLinkContext } from 'contexts/Link';
import CustomRouterPush from 'components/Link/CustomRouterPush';

export function NewChannelModal() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { status } = useSession();
  const { isSubDomainRouting, communityName, communityType } = useLinkContext();

  async function onSubmit(e: any) {
    setLoading(true);
    try {
      e.preventDefault();
      const form = e.target;
      const channel_name = form.channelName.value;
      const response = await fetch('/api/channels', {
        method: 'POST',
        body: JSON.stringify({
          communityName,
          channel_name,
        }),
      });
      if (!response.ok) {
        throw response;
      } else {
        setOpen(false);
        CustomRouterPush({
          isSubDomainRouting,
          communityName,
          communityType,
          path: `/c/${channel_name}`,
        });
      }
    } catch (error) {
      captureException(error);
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  if (status === 'authenticated')
    return (
      <>
        <button
          type="button"
          onClick={() => {
            setOpen(true);
          }}
          className="inline-flex items-center text-gray-400 hover:text-gray-500 text-sm font-medium"
        >
          <FiPlus />
        </button>
        <Transition.Root show={open} as={Fragment}>
          <Dialog
            as="div"
            className="relative z-10"
            onClose={() => setOpen(false)}
          >
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

            <div className="fixed inset-0 z-10 overflow-y-auto">
              <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                <Transition.Child
                  as={Fragment}
                  enter="ease-out duration-300"
                  enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                  enterTo="opacity-100 translate-y-0 sm:scale-100"
                  leave="ease-in duration-200"
                  leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                  leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                >
                  <form onSubmit={onSubmit}>
                    <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-sm sm:p-6">
                      <div>
                        <div className="flex items-center justify-between">
                          <Dialog.Title
                            as="h1"
                            className="text-lg font-bold leading-6 text-gray-900"
                          >
                            Create a channel
                          </Dialog.Title>

                          <button
                            type="button"
                            className="rounded-md bg-white text-gray-400 hover:text-gray-500"
                            onClick={() => setOpen(false)}
                          >
                            <span className="sr-only">Close</span>
                            <FiX />
                          </button>
                        </div>
                        <div className="mt-2">
                          <p className="text-sm text-gray-500">
                            Channels are where your community communicates.
                            They&apos;re best when organized around a topic.
                            e.g. javascript.
                          </p>
                        </div>

                        <div className="p-4"></div>

                        <TextInput
                          autoFocus
                          id="channelName"
                          label="Channel name"
                          required
                          placeholder="e.g. javascript"
                          {...{
                            pattern: '[a-z-]+',
                            title:
                              'Channels name should only contain lower case letters and hyphens. e.g. javascript',
                          }}
                        />

                        <span className="text-xs text-gray-500">
                          Be sure to choose an url friendly name.
                        </span>
                      </div>
                      <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                        <Button color="blue" type="submit" disabled={loading}>
                          {loading ? 'Loading...' : 'Create'}
                        </Button>
                      </div>
                    </Dialog.Panel>
                  </form>
                </Transition.Child>
              </div>
            </div>
          </Dialog>
        </Transition.Root>
      </>
    );

  return <></>;
}
