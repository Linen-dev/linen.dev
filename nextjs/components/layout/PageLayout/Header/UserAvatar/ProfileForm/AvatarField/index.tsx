import Avatar from 'components/Avatar';
import Label from 'components/Label';
import Field from 'components/Field';
import { SerializedUser } from 'serializers/user';
import styles from './index.module.scss';

interface Props {
  disabled: boolean;
  user: SerializedUser;
  onChange(event: React.ChangeEvent<HTMLInputElement>): void;
}

export default function AvatarField({ disabled, user, onChange }: Props) {
  // TODO add loading state to the Avatar
  return (
    <Field>
      <Label className={styles.label} htmlFor="avatar">
        Avatar
        <Avatar
          size="md"
          shadow="none"
          src={user.profileImageUrl}
          text={user.displayName}
        />
        <input
          className={styles.input}
          disabled={disabled}
          type="file"
          id="avatar"
          name="avatar"
          onChange={onChange}
        />
      </Label>
    </Field>
  );
}
