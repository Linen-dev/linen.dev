/* eslint-disable @next/next/no-img-element */
import PageLayout from 'components/layout/PageLayout';
import Header from './Header'
import TextField from 'components/TextField';
import ColorField from 'components/ColorField';
import { Button, Label } from '@linen/ui';
import Table, { Thead, Tbody, Th, Td } from 'components/Table';
import { stripProtocol } from 'utilities/url';
import classNames from 'classnames';
import { useS3Upload } from 'next-s3-upload';
import { useEffect, useState } from 'react';
import { Toast } from '@linen/ui';
import { SerializedAccount, SerializedChannel, Permissions, Settings } from '@linen/types';
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
  channels: SerializedChannel[];
  currentCommunity: SerializedAccount;
  permissions: Permissions;
  settings: Settings;
  isSubDomainRouting: boolean
}

export default function Branding({ channels, currentCommunity, permissions, settings, isSubDomainRouting }: Props) {
  const [records, setRecords] = useState<DNSRecord[]>()
  const router = useRouter();
  let [logoUrl, setLogoUrl] = useState<string>();
  let { FileInput, openFileDialog, uploadToS3, files } = useS3Upload();
  const isUploading = files && files.length > 0 && files[0].progress < 100;

  useEffect(() => {
    let mounted = true
    if (currentCommunity && currentCommunity.premium && currentCommunity.redirectDomain) {
      fetch(`/api/dns?communityId=${currentCommunity.id}`)
        .then((response) => response.json())
        .then((response) => {
          if (mounted && response && response.records) {
            setRecords(response.records)
          }
        })
    }
    return () => {
      mounted = false
    }
  }, [])

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
        communityId: currentCommunity.id,
        logoUrl,
        redirectDomain,
        brandColor,
        googleAnalyticsId,
      }),
    });
    if (response.ok) {
      Toast.success('Saved successfully!');
      router.reload();
    } else {
      const data = await response.json();
      Toast.error(data.error || 'Something went wrong!');
    }
  };

  const premiumAccountSettings = (
    <>
      <PremiumCard isPremium={currentCommunity.premium}>
        <Label htmlFor="redirectDomain">Redirect Domain</Label>
        <Description>Unique domain to redirect to.</Description>
        <TextField
          placeholder="linen.yourwebsite.com"
          id="redirectDomain"
          defaultValue={currentCommunity.premium ? currentCommunity.redirectDomain : undefined}
          disabled={!currentCommunity.premium}
          readOnly={!currentCommunity.premium}
        />
      </PremiumCard>
      {currentCommunity.premium && records && records.length > 0 && (
        <PremiumCard isPremium={currentCommunity.premium}>
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
      <PremiumCard isPremium={currentCommunity.premium}>
        <Label htmlFor="brandColor">Brand Color</Label>
        <Description>
          Color that matches your brand. We&apos;ll use it for the header
          background.
        </Description>
        <ColorField
          id="brandColor"
          defaultValue={currentCommunity.premium ? currentCommunity.brandColor : '#E2E2E2'}
          required
          readOnly={!currentCommunity.premium}
          disabled={!currentCommunity.premium}
        />
      </PremiumCard>
      <PremiumCard isPremium={currentCommunity.premium}>
        <Label htmlFor="logo">Logo</Label>
        <Description>Logo of your brand.</Description>
        <FileInput onChange={handleLogoChange} />
        {logoUrl ? (
          <img
            alt=""
            src={logoUrl}
            style={{
              backgroundColor: currentCommunity.brandColor,
            }}
            className={classNames('mb-2 mt-2')}
          />
        ) : (
          currentCommunity.logoUrl && (
            <img
              alt=""
              src={currentCommunity.logoUrl}
              style={{
                backgroundColor: currentCommunity.brandColor,
              }}
              className={classNames('mb-2 mt-2')}
            />
          )
        )}
        <Button
          onClick={() => !isUploading && openFileDialog()}
          disabled={!currentCommunity.premium || isUploading}
        >
          {isUploading ? 'Uploading...' : 'Upload file'}
        </Button>
      </PremiumCard>
      <PremiumCard isPremium={currentCommunity.premium}>
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
            currentCommunity.premium ? currentCommunity.googleAnalyticsId : undefined
          }
          disabled={!currentCommunity.premium}
          readOnly={!currentCommunity.premium}
        />
      </PremiumCard>
    </>
  );

  const settingsComponent = (
    <form onSubmit={onSubmit} className="p-3">
      <div className="grid grid-cols-1">
        <div className="flex flex-col">
          {premiumAccountSettings}
          <div className="flex justify-end">
            {!currentCommunity.premium ? (
              <Button
                color="yellow"
                onClick={() => router.push('/settings/plans')} // TODO
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
    <PageLayout
      channels={channels}
      permissions={permissions}
      settings={settings}
      isSubDomainRouting={isSubDomainRouting}
      className="w-full"
    >
      <Header/>
      {settingsComponent}
    </PageLayout>
  );
}
