import Button from '@linen/ui/Button';
import { SerializedAccount } from '@linen/types';
import Modal from '@linen/ui/Modal';
import { useState } from 'react';
import H3 from '@linen/ui/H3';
import { FiX } from '@react-icons/all-files/fi/FiX';
import TextInput from '@linen/ui/TextInput';
import { api } from 'utilities/requests';
import Toast from '@linen/ui/Toast';

export default function RemoveCommunity({
  currentCommunity,
}: {
  currentCommunity: SerializedAccount;
}) {
  const [open, setOpen] = useState(false);
  const [communityName, setCommunityName] = useState<string>();

  async function onRemoveConfirm() {
    api
      .deleteAccount({ accountId: currentCommunity.id })
      .then((_) => {
        Toast.success('Your community was put on a queue to be removed');
      })
      .catch((_) => {
        Toast.error(
          'Something went wrong, please try again later or email us at help@linen.dev'
        );
      })
      .finally(() => {
        setOpen(false);
      });
  }

  return (
    <div className="flex gap-4">
      {DeleteModal(
        open,
        setOpen,
        communityName,
        setCommunityName,
        currentCommunity,
        onRemoveConfirm
      )}
      <div className="grow">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          Delete this community
        </h3>
        <div className="mt-2 sm:flex sm:items-start sm:justify-between">
          <div className="max-w-xl text-sm text-gray-500">
            <p>
              Once you delete a community, there is no going back. Please be
              certain.
            </p>
          </div>
        </div>
      </div>
      <div className="m-auto">
        <Button
          onClick={() => {
            setOpen(true);
          }}
          color="danger"
        >
          Delete this community
        </Button>
      </div>
    </div>
  );
}

function DeleteModal(
  open: boolean,
  setOpen: React.Dispatch<React.SetStateAction<boolean>>,
  communityName: string | undefined,
  setCommunityName: React.Dispatch<React.SetStateAction<string | undefined>>,
  currentCommunity: SerializedAccount,
  onRemoveConfirm: () => Promise<void>
) {
  return (
    <Modal open={open} close={() => setOpen(false)} size="md">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <H3>Remove Community</H3>

          <div
            className="rounded-md bg-white text-gray-400 hover:text-gray-500 cursor-pointer"
            onClick={() => setOpen(false)}
          >
            <span className="sr-only">Close</span>
            <FiX />
          </div>
        </div>
        <div className="max-w-xl text-sm text-gray-500">
          <p>
            Once you delete a community, there is no going back. Please be
            certain.
          </p>
        </div>
        <TextInput
          autoFocus
          id="communityName"
          label="Please type your community path to confirm deletion"
          value={communityName}
          required
          onChange={(e) => setCommunityName(e.target.value)}
        />
        <Button
          onClick={() => {
            onRemoveConfirm();
          }}
          disabled={communityName !== currentCommunity.slackDomain}
          color={
            communityName !== currentCommunity.slackDomain
              ? 'disabled'
              : 'danger'
          }
        >
          Delete this community
        </Button>
      </div>
    </Modal>
  );
}
