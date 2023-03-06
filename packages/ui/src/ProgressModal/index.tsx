import React from 'react';
import Modal from '../Modal';

interface Props {
  open: boolean;
  close(): void;
  progress: number;
}

export default function ProgressModal({ open, close, progress }: Props) {
  return (
    <Modal open={open} close={close}>
      <progress max={100} value={progress}>
        {progress}%
      </progress>
    </Modal>
  );
}
