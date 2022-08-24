import React from 'react';
import { SerializedAttachment } from 'types/shared';
import styles from './index.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileArrowDown } from '@fortawesome/free-solid-svg-icons';

interface Props {
  attachment: SerializedAttachment;
}

function Attachment({ attachment }: Props) {
  return (
    <a
      className={styles.attachment}
      href={attachment.url}
      target="_blank"
      rel="noreferrer"
    >
      <FontAwesomeIcon className={styles.icon} icon={faFileArrowDown} />
      {attachment.name}
    </a>
  );
}

export default Attachment;
