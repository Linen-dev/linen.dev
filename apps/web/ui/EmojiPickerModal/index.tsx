import React from 'react';
import Modal from '@/Modal';
import EmojiPicker from '@/EmojiPicker';

interface Props {
  open: boolean;
  close(): void;
  onSelect(emoji: any): void;
}

export default function EmojiPickerModal({ open, close, onSelect }: Props) {
  return (
    <Modal open={open} close={close}>
      <EmojiPicker onSelect={onSelect} />
    </Modal>
  );
}
