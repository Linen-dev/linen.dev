import React, { useState } from 'react';
import classNames from 'classnames';
import Label from '@/Label';
import { SerializedAccount } from '@linen/types';
import styles from './index.module.scss';
import FileUploadButton from '@/FileUploadButton';
import type { ApiClient } from '@linen/api-client';

interface Props {
  id: string;
  currentCommunity: SerializedAccount;
  onChange(url: string): void;
  logoUrl?: string;
  header: string;
  description: string;
  preview?({
    logoUrl,
    brandColor,
  }: {
    logoUrl: string;
    brandColor?: string;
  }): React.ReactNode;
  api: ApiClient;
}

export default function LogoField({
  id,
  currentCommunity,
  onChange,
  logoUrl,
  header,
  description,
  preview,
  api,
}: Props) {
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);

  const onFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setProgress(0);
    setUploading(true);
    const data = new FormData();
    files.forEach((file, index) => {
      data.append(`file-${index}`, file, file.name);
    });
    try {
      const { files: files_1 } = await api.upload(
        { communityId: currentCommunity.id, data, type: 'logos' },
        {
          onUploadProgress: (progressEvent_1: ProgressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent_1.loaded * 100) / progressEvent_1.total
            );
            setProgress(percentCompleted);
          },
        }
      );
      setUploading(false);
      onChange(files_1[0].url);
    } catch (response) {
      setUploading(false);
      return response;
    }
  };

  return (
    <>
      <Label htmlFor="logo">
        {header}
        <Label.Description>{description}</Label.Description>
      </Label>

      {logoUrl &&
        (preview ? (
          preview({ logoUrl, brandColor: currentCommunity.brandColor })
        ) : (
          <img
            alt="logo url"
            src={logoUrl}
            style={{
              backgroundColor: currentCommunity.brandColor,
            }}
            className={classNames(styles.image)}
          />
        ))}

      <FileUploadButton
        id={id}
        onChange={onFileChange}
        disabled={!currentCommunity.premium || uploading}
        uploading={uploading}
        progress={progress}
        accept="image/*"
      />
    </>
  );
}
