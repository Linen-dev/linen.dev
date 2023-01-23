import Modal from 'components/Modal';
import H3 from 'components/H3';
import { FiX } from 'react-icons/fi';
import Form from 'components/Pages/Onboarding/Form';

interface Props {
  open: boolean;
  close(): void;
}

export default function NewCommunityModal({ open, close }: Props) {
  return (
    <Modal open={open} close={close}>
      <div className="flex items-center justify-between">
        <H3>Create a community</H3>
        <div
          className="rounded-md bg-white text-gray-400 hover:text-gray-500 cursor-pointer"
          onClick={close}
        >
          <span className="sr-only">Close</span>
          <FiX />
        </div>
      </div>
      <div className="py-4"></div>
      <Form />
    </Modal>
  );
}
