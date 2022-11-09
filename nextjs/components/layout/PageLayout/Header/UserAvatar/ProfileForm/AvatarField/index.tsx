import Avatar from 'components/Avatar';
import Label from 'components/Label';
import Field from 'components/Field';
import { SerializedUser } from 'serializers/user';

interface Props {
  user: SerializedUser;
}

export default function AvatarField({ user }: Props) {
  return (
    <Field>
      <Label htmlFor="avatar">
        Avatar
        <Avatar
          size="md"
          shadow="none"
          src={user.profileImageUrl}
          text={user.displayName}
        />
      </Label>
    </Field>
  );
}
