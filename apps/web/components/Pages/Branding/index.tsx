/* eslint-disable @next/next/no-img-element */
import PageLayout from 'components/layout/PageLayout';
import Header from './Header';
import TextField from '@linen/ui/TextField';
import ColorField from '@linen/ui/ColorField';
import LogoField from './LogoField';
import Label from '@linen/ui/Label';
import Table from '@linen/ui/Table';
import Thead from '@linen/ui/Thead';
import Th from '@linen/ui/Th';
import Tbody from '@linen/ui/Tbody';
import Td from '@linen/ui/Td';
import { stripProtocol } from '@linen/utilities/url';
import classNames from 'classnames';
import React, { useEffect, useState } from 'react';
import Toast from '@linen/ui/Toast';
import {
  SerializedAccount,
  SerializedChannel,
  Permissions,
  Settings,
} from '@linen/types';
import { useRouter } from 'next/router';
import { DNSRecord } from 'services/vercel';
import { api } from 'utilities/requests';
import debounce from '@linen/utilities/debounce';
import styles from './index.module.scss';

const debouncedUpdateAccount = debounce((params: any) =>
  api.updateAccount(params)
);

function Description({ children }: { children: React.ReactNode }) {
  return <div className={styles.description}>{children}</div>;
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
        '',
        readOnly ? 'pointer-events-none' : '',
        className
      )}
    >
      {children}
    </div>
  );
}

export interface Props {
  channels: SerializedChannel[];
  communities: SerializedAccount[];
  currentCommunity: SerializedAccount;
  permissions: Permissions;
  settings: Settings;
  isSubDomainRouting: boolean;
  dms: SerializedChannel[];
}

export default function Branding({
  channels,
  communities: initialCommunities,
  currentCommunity: initialCommunity,
  permissions,
  settings,
  isSubDomainRouting,
  dms,
}: Props) {
  const [records, setRecords] = useState<DNSRecord[]>();
  const router = useRouter();
  const [currentCommunity, setCurrentCommunity] =
    useState<SerializedAccount>(initialCommunity);
  const [communities, setCommunities] =
    useState<SerializedAccount[]>(initialCommunities);

  useEffect(() => {
    let mounted = true;
    if (
      currentCommunity &&
      currentCommunity.premium &&
      currentCommunity.redirectDomain
    ) {
      fetch(`/api/dns?communityId=${currentCommunity.id}`)
        .then((response) => response.json())
        .then((response) => {
          if (mounted && response && response.records) {
            setRecords(response.records);
          }
        });
    }
    return () => {
      mounted = false;
    };
  }, []);

  const updateAccount = async (options?: any) => {
    const form = document.getElementById('branding-form') as HTMLFormElement;
    if (!form) {
      return;
    }
    const redirectDomain = stripProtocol(
      form.redirectDomain.value
    ).toLowerCase();
    const googleAnalyticsId = form.googleAnalyticsId?.value;
    const brandColor = form.brandColor.value;
    const description = form.description.value;
    const params = {
      description,
      redirectDomain,
      brandColor,
      googleAnalyticsId,
      ...options,
    };
    return debouncedUpdateAccount({
      accountId: currentCommunity.id,
      ...params,
    }).catch((error: Error) => {
      Toast.error(error?.message || 'Something went wrong!');
    });
  };

  const onSubmit = async (event: any) => {
    event.preventDefault();
    return updateAccount();
  };

  return (
    <PageLayout
      channels={channels}
      communities={communities}
      currentCommunity={currentCommunity}
      permissions={permissions}
      settings={settings}
      isSubDomainRouting={isSubDomainRouting}
      className="w-full"
      dms={dms}
    >
      <div className={styles.container}>
        <Header />
        <form id="branding-form" onSubmit={onSubmit} className="p-3">
          <div className="grid grid-cols-1">
            <div className="flex flex-col">
              <PremiumCard isPremium={currentCommunity.premium}>
                <Label htmlFor="description">
                  Description
                  <Description>
                    Few sentences that describe your community. Maximum of 160
                    characters is preferred.
                  </Description>
                </Label>
                <TextField
                  placeholder=""
                  id="description"
                  defaultValue={
                    currentCommunity.premium
                      ? currentCommunity.description
                      : undefined
                  }
                  disabled={!currentCommunity.premium}
                  readOnly={!currentCommunity.premium}
                  onChange={() => updateAccount()}
                />
              </PremiumCard>
              <hr className="my-5" />
              <PremiumCard isPremium={currentCommunity.premium}>
                <Label htmlFor="redirectDomain">
                  Custom Domain
                  <Description>
                    Choose the custom url that Linen will live under. i.e
                    linen.yourwebsite.com
                  </Description>
                </Label>
                <TextField
                  placeholder="linen.yourwebsite.com or chat.yourwebsite.com"
                  id="redirectDomain"
                  defaultValue={
                    currentCommunity.premium
                      ? currentCommunity.redirectDomain
                      : undefined
                  }
                  disabled={!currentCommunity.premium}
                  readOnly={!currentCommunity.premium}
                  onChange={() => updateAccount()}
                />
              </PremiumCard>
              <hr className="my-5" />
              {currentCommunity.premium && records && records.length > 0 && (
                <>
                  <PremiumCard isPremium={currentCommunity.premium}>
                    <Label htmlFor="dnsRecords">
                      DNS
                      <Description>
                        Subdomain routing setup can be achieved by verifying the
                        ownership of a domain. Copy the TXT and/or CNAME records
                        from below and paste them into your DNS settings.
                      </Description>
                    </Label>
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
                  <hr className="my-5" />
                </>
              )}
              <PremiumCard isPremium={currentCommunity.premium}>
                <Label htmlFor="brandColor">
                  Brand Color
                  <Description>
                    Color that matches your brand. We&apos;ll use it for the
                    header background.
                  </Description>
                </Label>
                <ColorField
                  id="brandColor"
                  defaultValue={
                    currentCommunity.premium
                      ? currentCommunity.brandColor
                      : '#E2E2E2'
                  }
                  required
                  readOnly={!currentCommunity.premium}
                  disabled={!currentCommunity.premium}
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                    const brandColor = event.target.value;
                    setCurrentCommunity((community) => {
                      return {
                        ...community,
                        brandColor,
                      };
                    });
                    setCommunities((communities) => {
                      if (!communities || communities.length === 0) {
                        return communities;
                      }
                      return [
                        ...communities.map((community) => {
                          if (community.id === currentCommunity.id) {
                            return {
                              ...community,
                              brandColor,
                            };
                          }
                          return community;
                        }),
                      ];
                    });
                    updateAccount();
                  }}
                />
              </PremiumCard>
              <hr className="my-5" />
              <PremiumCard isPremium={currentCommunity.premium}>
                <LogoField
                  header="Logo"
                  description="Logo of your brand."
                  currentCommunity={currentCommunity}
                  onChange={(logoUrl) => {
                    updateAccount({ logoUrl }).then(() => {
                      router.reload();
                    });
                  }}
                  logoUrl={currentCommunity.logoUrl}
                  preview={({ logoUrl, brandColor }) => {
                    return (
                      <div
                        style={{
                          backgroundColor: brandColor,
                          height: 54,
                          display: 'flex',
                          alignItems: 'center',
                          padding: '0 1rem',
                          marginBottom: '0.5rem',
                        }}
                      >
                        <img src={logoUrl} height="24" style={{ height: 24 }} />
                      </div>
                    );
                  }}
                />
              </PremiumCard>
              <hr className="my-5" />
              <PremiumCard isPremium={currentCommunity.premium}>
                <LogoField
                  header="Logo Square"
                  description="Squared version of your logo that is going to be displayed in the navigation bar."
                  currentCommunity={currentCommunity}
                  onChange={(logoSquareUrl) => {
                    updateAccount({ logoSquareUrl }).then(() => {
                      router.reload();
                    });
                  }}
                  logoUrl={currentCommunity.logoSquareUrl}
                  preview={({ logoUrl, brandColor }) => {
                    return (
                      <div
                        style={{
                          backgroundColor: brandColor,
                          height: 36,
                          width: 36,
                          minWidth: 36,
                          borderRadius: '4px',
                          overflow: 'hidden',
                          marginBottom: '0.5rem',
                        }}
                      >
                        <img
                          src={logoUrl}
                          height="36"
                          width="36"
                          style={{ height: 36, width: 36 }}
                        />
                      </div>
                    );
                  }}
                />
              </PremiumCard>
              <hr className="my-5" />
              <PremiumCard isPremium={currentCommunity.premium}>
                <LogoField
                  header="Favicon"
                  description="An icon associated with your website, displayed in the address bar of a browser."
                  currentCommunity={currentCommunity}
                  onChange={(faviconUrl) => {
                    updateAccount({ faviconUrl }).then(() => {
                      router.reload();
                    });
                  }}
                  logoUrl={currentCommunity.faviconUrl}
                  preview={({ logoUrl, brandColor }) => {
                    return (
                      <div className={styles.favicon}>
                        <img
                          src={logoUrl}
                          height="16"
                          width="16"
                          style={{
                            display: 'block',
                            height: 16,
                            width: 16,
                          }}
                        />
                      </div>
                    );
                  }}
                />
              </PremiumCard>
              <hr className="my-5" />
              <PremiumCard
                className="mb-5"
                isPremium={currentCommunity.premium}
              >
                <Label htmlFor="googleAnalyticsId">
                  Google Analytics ID
                  <Description>
                    Enter a valid Analytics Property ID.
                  </Description>
                </Label>
                <TextField
                  placeholder="G-XXXXXXX or UA-XXXXXX-X"
                  id="googleAnalyticsId"
                  defaultValue={
                    currentCommunity.premium
                      ? currentCommunity.googleAnalyticsId
                      : undefined
                  }
                  disabled={!currentCommunity.premium}
                  readOnly={!currentCommunity.premium}
                  onChange={() => updateAccount()}
                />
              </PremiumCard>
            </div>
          </div>
        </form>
      </div>
    </PageLayout>
  );
}
