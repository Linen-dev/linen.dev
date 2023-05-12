import Button from '@linen/ui/Button';
import { usePresignedUpload } from 'next-s3-upload';
import { useRef, useState } from 'react';
import { SerializedAccount } from '@linen/types';
import Toast from '@linen/ui/Toast';
import Label from '@linen/ui/Label';
import { qs } from '@linen/utilities/url';
import { FiUploadCloud } from '@react-icons/all-files/fi/FiUploadCloud';

const fail = () => Toast.error('Something went wrong');

export default function SlackImportRow({
  currentCommunity,
}: {
  currentCommunity: SerializedAccount;
}) {
  const [loading, setLoading] = useState(false);
  let ref = useRef<HTMLInputElement>(null);

  let { uploadToS3, files } = usePresignedUpload();
  const openFileDialog = () => {
    if (ref.current) {
      ref.current.value = '';
      ref.current?.click();
    }
  };

  const handleFileChange = async (event: any) => {
    setLoading(true);
    try {
      const file = event.target.files[0];
      const uploadResult = await uploadToS3(file, {
        endpoint: {
          request: {
            body: {
              asset: 'slack-import',
            },
            headers: {},
          },
        },
      });
      if (!uploadResult.url) {
        throw uploadResult;
      }
      const startSync = await fetch(
        '/api/sync?' +
          qs({
            account_id: currentCommunity.id,
            file_location: uploadResult.url,
          })
      );
      if (!startSync.ok) {
        throw startSync;
      }
      Toast.success('Import process initiated');
    } catch (error) {
      console.error(error);
      fail();
    } finally {
      setLoading(false);
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
      <div className="pt-3">
        <input
          onChange={handleFileChange}
          ref={ref}
          type="file"
          className="hidden"
          accept=".zip"
        />
        <Button onClick={openFileDialog} disabled={loading}>
          <FiUploadCloud />
          {!loading ? 'Upload' : 'Uploading...'}
        </Button>
      </div>
    </>
  );
}
