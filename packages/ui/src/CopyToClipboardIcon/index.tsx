import React from 'react';
import { AiOutlinePaperClip } from '@react-icons/all-files/ai/AiOutlinePaperClip';
import Toast from '../Toast';
import { copyToClipboard } from '@linen/utilities/clipboard';

interface Props {
  getText(): string;
}

export default function CopyToClipboardIcon({ getText }: Props) {
  return (
    <AiOutlinePaperClip
      title="Copy to Clipboard"
      onClick={(event) => {
        const text = getText();
        event.stopPropagation();
        event.preventDefault();
        copyToClipboard(text);
        Toast.success('Copied to clipboard');
      }}
    />
  );
}
