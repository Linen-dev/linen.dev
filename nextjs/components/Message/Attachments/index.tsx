import React from 'react';
import Attachment from './Attachment';
import { SerializedAttachment } from 'types/shared';
import styles from './index.module.css';

interface Props {
  attachments?: SerializedAttachment[];
}

function Attachments({ attachments }: Props) {
  if (!attachments || attachments.length === 0) {
    return null;
  }
  return (
    <div className={styles.attachments}>
      {attachments.map((attachment: SerializedAttachment, index) => (
        <Attachment key={attachment.url + index} attachment={attachment} />
      ))}
    </div>
  );
}

export default Attachments;
