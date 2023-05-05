import React, { useState } from 'react';
import AvatarField from './AvatarField';
import PermissionsField from './PermissionsField';
import TextField from '@/TextField';
import Button from '@/Button';
import Toast from '@/Toast';
import { SerializedUser } from '@linen/types';
import {
  FILE_SIZE_LIMIT_IN_BYTES,
  getFileSizeErrorMessage,
} from '@linen/utilities/files';
import styles from './index.module.scss';

interface Props {
  currentUser: SerializedUser;
  onSubmit({ displayName }: { displayName: string }): Promise<void>;
  onUpload(data: FormData, options: any): Promise<void>;
}

export default function ProfileForm({
  currentUser,
  onSubmit,
  onUpload,
}: Props) {
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    event.stopPropagation();
    const form: any = event.target;
    const displayName = form.displayName.value;
    try {
      setSubmitting(true);
      await onSubmit({ displayName });
    } catch (exception) {
      Toast.error('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const onAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > FILE_SIZE_LIMIT_IN_BYTES) {
        event.target.value = '';
        return Toast.error(getFileSizeErrorMessage(file.name));
      }
      const formData = new FormData();
      formData.set('file', file, file.name);
      try {
        setUploading(true);
        await onUpload(formData, {
          onUploadProgress: (progressEvent: ProgressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setProgress(percentCompleted);
          },
        });
      } catch (exception) {
        event.target.value = '';
        Toast.error('Something went wrong. Please try again.');
      } finally {
        setUploading(false);
      }
    }
  };

  return (
    <>
      <h1 className={styles.h1Profile}>Profile</h1>
      <form onSubmit={handleSubmit} className={styles.form}>
        <AvatarField
          user={currentUser}
          onChange={onAvatarChange}
          uploading={uploading}
          progress={progress}
        />
        <TextField
          id="displayName"
          label="Display name"
          placeholder="John Doe"
          defaultValue={currentUser.displayName || ''}
        />
        <PermissionsField />
        <div className={styles.btnWrapper}>
          <Button className={styles.btn} type="submit" disabled={submitting}>
            Save
          </Button>
        </div>
      </form>
    </>
  );
}
