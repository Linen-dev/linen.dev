import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLink } from '@fortawesome/free-solid-svg-icons';
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
    <FontAwesomeIcon
      title="Copy to Clipboard"
      className="text-blue-700 p-1 hover:text-blue-900"
      icon={faLink}
      onClick={(event) => {
        event.stopPropagation();
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
