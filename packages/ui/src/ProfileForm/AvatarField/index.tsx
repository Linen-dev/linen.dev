import React, { useRef } from 'react';
import Avatar from '@/Avatar';
import Button from '@/Button';
import Label from '@/Label';
import Field from '@/Field';
import { SerializedUser } from '@linen/types';
import styles from './index.module.scss';
import { FiUploadCloud } from '@react-icons/all-files/fi/FiUploadCloud';

interface Props {
  uploading: boolean;
  user: SerializedUser;
  progress: number;
  onChange(event: React.ChangeEvent<HTMLInputElement>): void;
}

export default function AvatarField({
  uploading,
  user,
  progress,
  onChange,
}: Props) {
  let ref = useRef<HTMLInputElement>(null);
  const openFileDialog = () => {
    if (ref.current) {
      ref.current.value = '';
      ref.current?.click();
    }
  };
  return (
    <Field>
      <div className={styles.row}>
        <Avatar src={user.profileImageUrl} text={user.displayName} size="xl" />
        <div>
          <Button onClick={openFileDialog} disabled={uploading} color="gray">
            <FiUploadCloud />{' '}
            {!uploading ? 'Change avatar' : `Uploading... ${progress}%`}
          </Button>
          <div className={styles.text}>JPG, GIF or PNG. 2MB max.</div>
        </div>
      </div>
      <input
        className={styles.input}
        disabled={uploading}
        type="file"
        id="avatar"
        name="avatar"
        ref={ref}
        onChange={onChange}
      />
    </Field>
  );
}
