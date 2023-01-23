import { useState } from 'react';
import H3 from 'components/H3';
import { FiPlus, FiX } from 'react-icons/fi';
import { Button, TextInput, Toast } from '@linen/ui';
import { useLinkContext } from '@linen/contexts/Link';
import CustomRouterPush from 'components/Link/CustomRouterPush';
import { patterns } from 'utilities/util';
import Modal from 'components/Modal';

export default function NewChannelModal({
  communityId,
}: {
  communityId: string;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { isSubDomainRouting, communityName, communityType } = useLinkContext();

  async function onSubmit(e: any) {
    setLoading(true);
    try {
      e.preventDefault();
      const form = e.target;
      const channelName = form.channelName.value;
      const response = await fetch('/api/channels', {
        method: 'POST',
        body: JSON.stringify({
          communityId,
          channelName,
        }),
      });
      const data = await response.json();
      if (response.status === 400 && data.error) {
        setLoading(false);
        return Toast.error(data.error);
      }
      if (!response.ok) {
        setLoading(false);
        throw response;
      } else {
        setOpen(false);
        CustomRouterPush({
          isSubDomainRouting,
          communityName,
          communityType,
          path: `/c/${channelName}`,
        });
      }
    } catch (error) {
      setLoading(false);
      Toast.error('Something went wrong');
    }
  }

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
      <Modal open={open} close={() => setOpen(false)}>
        <form onSubmit={onSubmit}>
          <div>
            <div className="flex items-center justify-between">
              <H3>Create a channel</H3>

              <div
                className="rounded-md bg-white text-gray-400 hover:text-gray-500 cursor-pointer"
                onClick={() => setOpen(false)}
              >
                <span className="sr-only">Close</span>
                <FiX />
              </div>
            </div>
            <div className="mt-2 mb-8">
              <p className="text-sm text-gray-500">
                Channels are where your community communicates. They&apos;re
                best when organized around a topic. e.g. javascript.
              </p>
            </div>

            <TextInput
              autoFocus
              id="channelName"
              label="Channel name"
              
              disabled={loading}
              required
              placeholder="e.g. javascript"
              {...{
                pattern: patterns.channelName.source,
                title:
                  'Channels name should start with letter and could contain letters, underscore, numbers and hyphens. e.g. announcements',
              }}
            />

            <span className="text-xs text-gray-500">
              Be sure to choose an url friendly name.
            </span>
          </div>
          <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
            <Button color="blue" type="submit" disabled={loading}>
              Create
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
