import React from 'react';
import Attachment from './Attachment';
import { SerializedAttachment } from 'types/shared';
import styles from './index.module.css';
import { isImage } from '../Link/utilities';
import Image from '../Link/Image';

interface Props {
  attachments?: SerializedAttachment[];
}

function Attachments({ attachments }: Props) {
  if (!attachments || attachments.length === 0) {
    return null;
  }
  return (
    <div className={styles.attachments}>
      {attachments.map((attachment: SerializedAttachment, index) =>
        isImage(attachment.url) ? (
          <Image src={attachment.url} />
        ) : (
          <Attachment key={attachment.url + index} attachment={attachment} />
        )
      )}
    </div>
  );
}

export default Attachments;
