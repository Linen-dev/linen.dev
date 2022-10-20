import React, { useState } from 'react';
import { post } from 'utilities/http';
import TextField from 'components/TextField';
import Button from 'components/Button';
import { toast } from 'components/Toast';
import { SerializedUser } from 'serializers/user';

interface Props {
  currentUser: SerializedUser;
  afterSubmit(): void;
}

export default function ProfileForm({ currentUser, afterSubmit }: Props) {
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
            await post('/api/profile', {
              userId: currentUser.id,
              displayName,
            });
            afterSubmit();
          } catch (exception) {
            toast.error('Something went wrong. Please try again.');
          } finally {
            setSubmitting(false);
          }
        }}
      >
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
