import React from 'react';
import { AiOutlinePaperClip } from 'react-icons/ai';
import { toast } from 'components/Toast';
import { copyToClipboard } from 'utilities/clipboard';

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
        toast.success('Copied to clipboard', text);
      }}
    />
  );
}
