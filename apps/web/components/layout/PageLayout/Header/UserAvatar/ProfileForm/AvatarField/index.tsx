import { Avatar, Label } from '@linen/ui';
import Image from 'next/image';
import Field from 'components/Field';
import { SerializedUser } from '@linen/types';
import styles from './index.module.scss';

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
  // TODO add loading state to the Avatar
  return (
    <Field>
      <Label className={styles.label} htmlFor="avatar">
        Avatar
        <div className={styles.row}>
          <Avatar
            shadow="none"
            src={user.profileImageUrl}
            text={user.displayName}
            Image={Image}
          />
          {uploading ? (
            <span className={styles.text}>{`Uploading... ${progress}%`}</span>
          ) : (
            <span className={styles.edit}>Upload</span>
          )}
        </div>
        <input
          className={styles.input}
          disabled={uploading}
          type="file"
          id="avatar"
          name="avatar"
          onChange={onChange}
        />
      </Label>
    </Field>
  );
}
