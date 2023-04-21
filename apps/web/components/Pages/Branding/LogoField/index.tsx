import React from 'react';
import classNames from 'classnames';
import { useS3Upload } from 'next-s3-upload';
import Button from '@linen/ui/Button';
import Label from '@linen/ui/Label';
import { SerializedAccount } from '@linen/types';

interface Props {
  currentCommunity: SerializedAccount;
  onChange(url: string): void;
  logoUrl?: string;
  header: string;
  description: string;
}

function Description({ children }: { children: React.ReactNode }) {
  return <div className="text-xs font-normal text-gray-600">{children}</div>;
}

export default function LogoField({
  currentCommunity,
  onChange,
  logoUrl,
  header,
  description,
}: Props) {
  let { FileInput, openFileDialog, uploadToS3, files } = useS3Upload();
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
        <Description>{description}</Description>
      </Label>
      <FileInput onChange={handleLogoChange} />
      {logoUrl && (
        <img
          alt=""
          src={logoUrl}
          style={{
            backgroundColor: currentCommunity.brandColor,
          }}
          className={classNames('mb-2 mt-2 max-h-60')}
        />
      )}
      <Button
        onClick={() => !isUploading && openFileDialog()}
        disabled={!currentCommunity.premium || isUploading}
      >
        {isUploading ? 'Uploading...' : 'Upload file'}
      </Button>
    </>
  );
}
