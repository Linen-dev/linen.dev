import React, { useState } from 'react';
import AvatarField from './AvatarField';
import TextField from 'components/TextField';
import Button from 'components/Button';
import { toast } from 'components/Toast';
import { SerializedUser } from 'serializers/user';
import {
  FILE_SIZE_LIMIT_IN_BYTES,
  getFileSizeErrorMessage,
} from 'utilities/files';

interface Props {
  currentUser: SerializedUser;
  onSubmit({
    displayName,
    userId,
  }: {
    displayName: string;
    userId: string;
  }): void;
  onUpload(data: FormData): void;
}

export default function ProfileForm({
  currentUser,
  onSubmit,
  onUpload,
}: Props) {
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
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
  };

  const onAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > FILE_SIZE_LIMIT_IN_BYTES) {
        event.target.value = '';
        return toast.error(getFileSizeErrorMessage(file.name));
      }
      const formData = new FormData();
      formData.set('file', file, file.name);
      try {
        setUploading(true);
        await onUpload(formData);
      } catch (exception) {
        event.target.value = '';
        toast.error('Something went wrong. Please try again.');
      } finally {
        setUploading(false);
      }
    }
  };

  return (
    <>
      <h1 className="text-xl font-bold mb-3">Profile</h1>
      <form onSubmit={handleSubmit}>
        <AvatarField
          user={currentUser}
          onChange={onAvatarChange}
          disabled={uploading}
        />
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
