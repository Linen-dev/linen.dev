import React from 'react';
import { AiOutlinePaperClip } from 'react-icons/ai';
import { toast } from 'components/Toast';
import { copyToClipboard } from 'utilities/clipboard';

interface Props {
  text: string;
}

export default function CopyToClipboardIcon({ text }: Props) {
  return (
    <AiOutlinePaperClip
      title="Copy to Clipboard"
      className="text-blue-700 text-lg hover:text-blue-900"
      onClick={(event) => {
        event.stopPropagation();
        event.preventDefault();
        copyToClipboard(text);
        toast.success('Copied to clipboard', text);
      }}
    />
  );
}
