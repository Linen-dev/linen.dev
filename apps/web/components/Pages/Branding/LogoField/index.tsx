import React from 'react';
import classNames from 'classnames';
import { usePresignedUpload } from 'next-s3-upload';
import Button from '@linen/ui/Button';
import Label from '@linen/ui/Label';
import { SerializedAccount } from '@linen/types';
import { FiUploadCloud } from '@react-icons/all-files/fi/FiUploadCloud';
import { FiLoader } from '@react-icons/all-files/fi/FiLoader';
import styles from './index.module.scss';

interface Props {
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
}

export default function LogoField({
  currentCommunity,
  onChange,
  logoUrl,
  header,
  description,
  preview,
}: Props) {
  let { FileInput, openFileDialog, uploadToS3, files } = usePresignedUpload();
  const isUploading = files && files.length > 0 && files[0].progress < 100;

  let handleLogoChange = async (file: File) => {
    let { url } = await uploadToS3(file, {
      endpoint: {
        request: {
          body: {
            asset: 'logos',
            accountId: currentCommunity.id,
          },
          headers: {},
        },
      },
    });
    onChange(url);
  };

  return (
    <>
      <Label htmlFor="logo">
        {header}
        <Label.Description>{description}</Label.Description>
      </Label>
      <FileInput onChange={handleLogoChange} />

      {logoUrl &&
        (preview ? (
          preview({ logoUrl, brandColor: currentCommunity.brandColor })
        ) : (
          <img
            alt=""
            src={logoUrl}
            style={{
              backgroundColor: currentCommunity.brandColor,
            }}
            className={classNames('mb-2 mt-2 max-h-60')}
          />
        ))}
      <Button
        onClick={() => !isUploading && openFileDialog()}
        disabled={!currentCommunity.premium || isUploading}
      >
        {isUploading ? <FiLoader className={styles.spin} /> : <FiUploadCloud />}
        Upload
      </Button>
    </>
  );
}
