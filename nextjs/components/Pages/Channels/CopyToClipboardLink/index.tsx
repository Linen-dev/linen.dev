import React from 'react';
import { AiOutlinePaperClip } from 'react-icons/ai';
import CustomLinkHelper from '../../../Link/CustomLinkHelper';
import { copyToClipboard } from 'utilities/clipboard';
import { toast } from 'components/Toast';

interface Props {
  isSubDomainRouting: boolean;
  communityName: string;
  communityType: string;
  path: string;
}

export default function CopyToClipboardLink({
  isSubDomainRouting,
  communityName,
  communityType,
  path,
}: Props) {
  return (
    <AiOutlinePaperClip
      title="Copy to Clipboard"
      className="text-blue-700 text-lg hover:text-blue-900"
      onClick={(event) => {
        event.stopPropagation();
        event.preventDefault();
        const pathname = CustomLinkHelper({
          isSubDomainRouting,
          communityName,
          communityType,
          path,
        });
        const url = `${window.location.origin}${pathname}`;
        copyToClipboard(url);
        toast.success('Copied to clipboard', url);
      }}
    />
  );
}
