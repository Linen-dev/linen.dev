import React from 'react';
import Attachment from './Attachment';
import { SerializedAttachment } from '@linen/types';
import styles from './index.module.scss';
import { isImage } from '../Link/utilities';
import Image from '../Link/Image';

interface Props {
  attachments?: SerializedAttachment[];
  onLoad?(): void;
}

function Attachments({ attachments, onLoad }: Props) {
  if (!attachments || attachments.length === 0) {
    return null;
  }
  return (
    <div className={styles.attachments}>
      {attachments.map((attachment: SerializedAttachment, index) =>
        isImage(attachment.url) ? (
          <a key={attachment.url + index} className={styles.image} href={attachment.url} target="_blank">
            <Image
              src={attachment.url}
              onLoad={onLoad}
            />
          </a>
        ) : (
          <Attachment key={attachment.url + index} attachment={attachment} />
        )
      )}
    </div>
  );
}

export default Attachments;
