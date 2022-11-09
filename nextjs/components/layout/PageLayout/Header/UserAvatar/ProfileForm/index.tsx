import React, { useState } from 'react';
import AvatarField from './AvatarField';
import TextField from 'components/TextField';
import Button from 'components/Button';
import { toast } from 'components/Toast';
import { SerializedUser } from 'serializers/user';

interface Props {
  currentUser: SerializedUser;
  onSubmit({
    displayName,
    userId,
  }: {
    displayName: string;
    userId: string;
  }): void;
}

export default function ProfileForm({ currentUser, onSubmit }: Props) {
  const [submitting, setSubmitting] = useState(false);
  return (
    <>
      <h1 className="text-xl font-bold mb-3">Profile</h1>
      <form
        onSubmit={async (event: React.FormEvent) => {
          event.preventDefault();
          event.stopPropagation();
          const form: any = event.target;
          const displayName = form.displayName.value;
          try {
            setSubmitting(true);
            await onSubmit({ displayName, userId: currentUser.id });
          } catch (exception) {
            toast.error('Something went wrong. Please try again.');
          } finally {
            setSubmitting(false);
          }
        }}
      >
        <AvatarField user={currentUser} />
        <TextField
          id="displayName"
          label="Display name"
          placeholder="John Doe"
          defaultValue={currentUser.displayName || ''}
        />
        <div className="text-right">
          <Button
            className="mt-3 text-right"
            type="submit"
            disabled={submitting}
          >
            Save
          </Button>
        </div>
      </form>
    </>
  );
}
