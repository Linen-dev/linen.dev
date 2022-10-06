/* eslint-disable @next/next/no-img-element */
import DashboardLayout from 'components/layout/DashboardLayout';
import TextField from 'components/TextField';
import ColorField from 'components/ColorField';
import Button from 'components/Button';
import Table, { Thead, Tbody, Th, Td } from 'components/Table';
import { stripProtocol } from 'utilities/url';
import Label from 'components/Label';
import classNames from 'classnames';
import { useS3Upload } from 'next-s3-upload';
import { useState } from 'react';
import { toast } from 'components/Toast';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { SerializedAccount } from 'serializers/account';
import { useRouter } from 'next/router';
import { DNSRecord } from 'services/vercel';

function Description({ children }: { children: React.ReactNode }) {
  return <div className="text-sm mb-2 text-gray-600">{children}</div>;
}

function PremiumCard({
  children,
  isPremium = false,
  className = '',
}: {
  children: React.ReactNode;
  isPremium?: boolean;
  className?: string;
}) {
  return (
    <Card readOnly={!isPremium} className={className}>
      {children}
    </Card>
  );
}

function Card({
  children,
  readOnly = false,
  className = '',
}: {
  children: React.ReactNode;
  readOnly?: boolean;
  className?: string;
}) {
  return (
    <div
      className={classNames(
        'p-3 mb-3 rounded border-gray-200 border-solid border',
        readOnly ? 'bg-slate-50 pointer-events-none' : '',
        className
      )}
    >
      {children}
    </div>
  );
}

interface Props {
  account?: SerializedAccount;
  records?: DNSRecord[];
}

export default function Branding({ account, records }: Props) {
  const router = useRouter();
  let [logoUrl, setLogoUrl] = useState<string>();
  let { FileInput, openFileDialog, uploadToS3, files } = useS3Upload();

  let handleLogoChange = async (file: File) => {
    let { url } = await uploadToS3(file, {
      endpoint: {
        request: {
          body: {
            asset: 'logos',
            accountId: account?.id,
          },
          headers: {},
        },
      },
    });
    setLogoUrl(url);
  };

  const onSubmit = async (event: any) => {
    event.preventDefault();
    const form = event.target;
    const redirectDomain = stripProtocol(form.redirectDomain.value);
    const googleAnalyticsId = form.googleAnalyticsId?.value;
    const brandColor = form.brandColor.value;
    const response = await fetch('/api/accounts', {
      method: 'PUT',
      body: JSON.stringify({
        communityId: account?.id,
        logoUrl,
        redirectDomain,
        brandColor,
        googleAnalyticsId,
      }),
    });
    if (response.ok) {
      toast.success('Saved successfully!');
      router.reload();
    } else {
      const data = await response.json();
      toast.error(data.error || 'Something went wrong!');
    }
  };

  const premiumAccountSettings = (
    <>
      <PremiumCard isPremium={account?.premium}>
        <Label htmlFor="redirectDomain">Redirect Domain</Label>
        <Description>Unique domain to redirect to.</Description>
        <TextField
          placeholder="linen.yourwebsite.com"
          id="redirectDomain"
          defaultValue={account?.premium ? account?.redirectDomain : undefined}
          disabled={!account?.premium}
          readOnly={!account?.premium}
        />
      </PremiumCard>
      {account?.premium && records && records.length > 0 && (
        <PremiumCard isPremium={account?.premium}>
          <Label htmlFor="dnsRecords">DNS</Label>
          <Description>
            Subdomain routing setup can be achieved by verifying the ownership
            of a domain. Copy the TXT and/or CNAME records from below and paste
            them into your DNS settings.
          </Description>
          <Table>
            <Thead>
              <tr>
                <Th>Type</Th>
                <Th>Name</Th>
                <Th>Value</Th>
              </tr>
            </Thead>
            <Tbody>
              {records.map((record: DNSRecord, index) => (
                <tr key={record.type + index}>
                  <Td>{record.type}</Td>
                  <Td>{record.name}</Td>
                  <Td>{record.value}</Td>
                </tr>
              ))}
            </Tbody>
          </Table>
        </PremiumCard>
      )}
      <PremiumCard isPremium={account?.premium}>
        <Label htmlFor="brandColor">Brand Color</Label>
        <Description>
          Color that matches your brand. We&apos;ll use it for the header
          background.
        </Description>
        <ColorField
          id="brandColor"
          defaultValue={account?.premium ? account?.brandColor : '#E2E2E2'}
          required
          readOnly={!account?.premium}
          disabled={!account?.premium}
        />
      </PremiumCard>
      <PremiumCard isPremium={account?.premium}>
        <Label htmlFor="logo">Logo</Label>
        <Description>Logo of your brand.</Description>
        <FileInput onChange={handleLogoChange} />
        {logoUrl ? (
          <img
            alt=""
            src={logoUrl}
            style={{
              backgroundColor: account?.brandColor,
            }}
            className={classNames('mb-2 mt-2')}
          />
        ) : (
          account?.logoUrl && (
            <img
              alt=""
              src={account?.logoUrl}
              style={{
                backgroundColor: account?.brandColor,
              }}
              className={classNames('mb-2 mt-2')}
            />
          )
        )}
        <Button onClick={openFileDialog} disabled={!account?.premium}>
          {files && files.length > 0 && files[0].progress < 100 && (
            <FontAwesomeIcon icon={faSpinner} spin={true} size="lg" />
          )}
          Upload file
        </Button>
      </PremiumCard>
      <PremiumCard isPremium={account?.premium}>
        <Label htmlFor="googleAnalyticsId">Google Analytics ID</Label>
        <Description>
          You can collect data from your website with Google Analytics.
          <br />
          Enter a valid Analytics Property ID.
        </Description>
        <TextField
          placeholder="G-XXXXXXX or UA-XXXXXX-X"
          id="googleAnalyticsId"
          defaultValue={
            account?.premium ? account?.googleAnalyticsId : undefined
          }
          disabled={!account?.premium}
          readOnly={!account?.premium}
        />
      </PremiumCard>
    </>
  );

  const settingsComponent = (
    <form onSubmit={onSubmit}>
      <div className="grid grid-cols-1">
        <div className="flex flex-col">
          {premiumAccountSettings}
          <div className="flex justify-end">
            {!account?.premium ? (
              <Button
                color="yellow"
                onClick={() => router.push('/settings/plans')}
              >
                Upgrade your account
              </Button>
            ) : (
              <Button type="submit">Update</Button>
            )}
          </div>
        </div>
      </div>
    </form>
  );

  return (
    <DashboardLayout header="Branding" account={account}>
      {settingsComponent}
    </DashboardLayout>
  );
}
