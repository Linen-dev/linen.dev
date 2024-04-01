import Button from '@/Button';
import React, { useRef, useState } from 'react';
import { SerializedAccount } from '@linen/types';
import Toast from '@/Toast';
import Label from '@/Label';
import { FiUploadCloud } from '@react-icons/all-files/fi/FiUploadCloud';
import type { ApiClient } from '@linen/api-client';
import styles from './index.module.scss';
import { qs } from '@linen/utilities/url';

export default function SlackImportRow({
  currentCommunity,
  api,
}: {
  currentCommunity: SerializedAccount;
  api: ApiClient;
}) {
  let ref = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const openFileDialog = () => {
    if (ref.current) {
      ref.current.value = '';
      ref.current?.click();
    }
  };

  const onFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files?.length) return;

    const file = event.target.files.item(0);
    if (!file) return;

    setProgress(0);
    setUploading(true);

    try {
      const { url, fileUrl } = await api.get<{ url: string; fileUrl: string }>(
        `/api/accounts/slack-import?${qs({ accountId: currentCommunity.id })}`
      );
      await api.putWithOptions(url, file, {
        headers: {
          'Content-Length': new Blob([file]).size,
        },
        onUploadProgress: (progressEvent_1: ProgressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent_1.loaded * 100) / progressEvent_1.total
          );
          setProgress(percentCompleted);
        },
      });
      setUploading(false);
      await api.startSync({
        account_id: currentCommunity.id,
        file_location: fileUrl,
      });
      Toast.success('Import process initiated');
    } catch (response) {
      setUploading(false);
      Toast.error('Something went wrong');
    }
  };

  return (
    <>
      <Label htmlFor="integration">
        Import conversations from Slack
        <Label.Description>
          You can import all your public channel conversations beyond 90 days
          from Slack (even on free tier). See instructions on how to export it{' '}
          <a
            rel="noreferrer"
            href="https://slack.com/help/articles/201658943-Export-your-workspace-data"
            target="_blank"
            className="underline"
          >
            here
          </a>
          .
        </Label.Description>
      </Label>
      <div>
        <input
          onChange={onFileChange}
          ref={ref}
          type="file"
          className={styles.hidden}
          accept=".zip"
        />
        <Button onClick={openFileDialog} disabled={uploading}>
          <FiUploadCloud />
          {!uploading ? 'Upload' : `Uploading... ${progress}%`}
        </Button>
      </div>
    </>
  );
}
