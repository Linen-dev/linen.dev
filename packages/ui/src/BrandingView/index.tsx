import React, { useEffect, useState } from 'react';
import Header from './Header';
import TextField from '@/TextField';
import ColorField from '@/ColorField';
import LogoField from './LogoField';
import Label from '@/Label';
import Table from '@/Table';
import Thead from '@/Thead';
import Th from '@/Th';
import Tbody from '@/Tbody';
import Td from '@/Td';
import { stripProtocol } from '@linen/utilities/url';
import Toast from '@/Toast';
import type { SerializedAccount, DNSRecord } from '@linen/types';
import debounce from '@linen/utilities/debounce';
import styles from './index.module.scss';
import type { ApiClient } from '@linen/api-client';
import { PremiumCard } from './PremiumCard';
import UpgradeButton from '@/Header/UpgradeButton';
import Button from '@/Button';
import Spinner from '@/Spinner';

export default function BrandingView({
  reload,
  initialCommunity,
  api,
  setCommunities,
  InternalLink,
}: {
  reload(): void;
  initialCommunity: SerializedAccount;
  api: ApiClient;
  setCommunities: React.Dispatch<React.SetStateAction<SerializedAccount[]>>;
  InternalLink: any;
}) {
  const [records, setRecords] = useState<DNSRecord[]>();
  const [currentCommunity, setCurrentCommunity] =
    useState<SerializedAccount>(initialCommunity);
  const debouncedUpdateAccount = debounce(api.updateAccount);

  useEffect(() => {
    let mounted = true;
    if (
      currentCommunity &&
      currentCommunity.premium &&
      currentCommunity.redirectDomain
    ) {
      dnsSettings(mounted);
    }
    return () => {
      mounted = false;
    };
  }, []);

  function dnsSettings(mounted: boolean) {
    api
      .getDnsSettings(currentCommunity.id)
      .then((response) => {
        if (mounted && response && response.records) {
          setRecords(response.records);
        }
      })
      .catch((_) => {});
  }

  const updateAccount = async (options?: any) => {
    const form = document.getElementById('branding-form') as HTMLFormElement;
    if (!form) {
      return;
    }
    const googleAnalyticsId = form.googleAnalyticsId?.value;
    const brandColor = form.brandColor.value;
    const description = form.description.value;
    const params = {
      description,
      brandColor,
      googleAnalyticsId,
      ...options,
    };
    return debouncedUpdateAccount({
      accountId: currentCommunity.id,
      ...params,
    }).catch((error: any) => {
      Toast.error(error.details || error.message || 'Something went wrong!');
    });
  };

  const onSubmit = async (event: any) => {
    event.preventDefault();
    return updateAccount();
  };
  return (
    <div className={styles.container}>
      <Header />
      <form id="branding-form" onSubmit={onSubmit} className={styles.p3}>
        {!currentCommunity.premium && (
          <UpgradeButton
            className={styles.upgrade}
            label="Upgrade to Premium"
            InternalLink={InternalLink}
          />
        )}
        <div className={styles.wrapper}>
          <div className={styles.flexCol}>
            <PremiumCard isPremium={currentCommunity.premium}>
              <Label htmlFor="description">
                Description
                <Label.Description>
                  Few sentences that describe your community. Maximum of 160
                  characters is preferred.
                </Label.Description>
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
            <hr className={styles.my5} />
            <PremiumCard isPremium={currentCommunity.premium}>
              <Label htmlFor="redirectDomain">
                Custom Domain
                <Label.Description>
                  Choose the custom url that Linen will live under. i.e
                  linen.yourwebsite.com
                </Label.Description>
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
              />
              <DomainStatus
                currentCommunity={currentCommunity}
                api={api}
                dnsSettings={dnsSettings}
              />
            </PremiumCard>
            <hr className={styles.my5} />
            {currentCommunity.premium && records && records.length > 0 && (
              <>
                <PremiumCard isPremium={currentCommunity.premium}>
                  <Label htmlFor="dnsRecords">
                    DNS
                    <Label.Description>
                      Subdomain routing setup can be achieved by verifying the
                      ownership of a domain. Copy the TXT and/or CNAME records
                      from below and paste them into your DNS settings.
                    </Label.Description>
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
                <hr className={styles.my5} />
              </>
            )}
            <PremiumCard isPremium={currentCommunity.premium}>
              <Label htmlFor="brandColor">
                Brand Color
                <Label.Description>
                  Color that matches your brand. We&apos;ll use it for the
                  header background.
                </Label.Description>
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
            <hr className={styles.my5} />
            <PremiumCard isPremium={currentCommunity.premium}>
              <LogoField
                id="logoUrl"
                header="Logo"
                description="Logo of your brand."
                currentCommunity={currentCommunity}
                onChange={(logoUrl) => {
                  updateAccount({ logoUrl }).then(() => {
                    reload();
                  });
                }}
                api={api}
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
                      <img
                        src={logoUrl}
                        height="24"
                        style={{ height: 24 }}
                        alt="brand-logo"
                      />
                    </div>
                  );
                }}
              />
            </PremiumCard>
            <hr className={styles.my5} />
            <PremiumCard isPremium={currentCommunity.premium}>
              <LogoField
                id="logoSquareUrl"
                header="Logo Square"
                description="Squared version of your logo that is going to be displayed in the navigation bar."
                currentCommunity={currentCommunity}
                onChange={(logoSquareUrl) => {
                  updateAccount({ logoSquareUrl }).then(() => {
                    reload();
                  });
                }}
                api={api}
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
                        alt="square-logo"
                      />
                    </div>
                  );
                }}
              />
            </PremiumCard>
            <hr className={styles.my5} />
            <PremiumCard isPremium={currentCommunity.premium}>
              <LogoField
                id="faviconUrl"
                header="Favicon"
                description="An icon associated with your website, displayed in the address bar of a browser."
                currentCommunity={currentCommunity}
                onChange={(faviconUrl) => {
                  updateAccount({ faviconUrl }).then(() => {
                    reload();
                  });
                }}
                api={api}
                logoUrl={currentCommunity.faviconUrl}
                preview={({ logoUrl, brandColor }) => {
                  return (
                    <div className={styles.favicon}>
                      <img
                        src={logoUrl}
                        height="16"
                        width="16"
                        alt="favicon"
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
            <hr className={styles.my5} />
            <PremiumCard
              className={styles.mb5}
              isPremium={currentCommunity.premium}
            >
              <Label htmlFor="googleAnalyticsId">
                Google Analytics ID
                <Label.Description>
                  Enter a valid Analytics Property ID.
                </Label.Description>
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
  );
}

function DomainStatus({
  currentCommunity,
  api,
  dnsSettings,
}: {
  currentCommunity: SerializedAccount;
  api: ApiClient;
  dnsSettings(mounted: boolean): void;
}) {
  const [statusText, setStatusText] = useState<string>(
    currentCommunity.redirectDomainPropagate
      ? 'Custom domain is working.'
      : 'Custom domain is not working.'
  );
  const [statusColor, setStatusColor] = useState<'green' | 'red'>(
    currentCommunity.redirectDomainPropagate ? 'green' : 'red'
  );
  const [loading, setLoading] = useState(false);

  const validateDomain = async () => {
    const form = document.getElementById('branding-form') as HTMLFormElement;
    if (!form) {
      return;
    }

    try {
      setLoading(true);
      const domain = stripProtocol(form.redirectDomain.value).toLowerCase();

      if (domain !== currentCommunity.redirectDomain) {
        await api.updateAccount({
          accountId: currentCommunity.id,
          redirectDomain: domain,
        });
        dnsSettings(true);
        currentCommunity.redirectDomain = domain;
      }

      const result = await api.validateDomain({
        domain,
        accountId: currentCommunity.id,
      });

      if (result.ok) {
        setStatusColor('green');
        setStatusText('Custom domain is working.');
      } else {
        setStatusColor('red');
        setStatusText(result.cause || 'Invalid, try again later.');
      }
    } catch (error: any) {
      setStatusColor('red');
      setStatusText(error.details || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.domainValidationWrapper}>
      <span
        className={styles.domainValidationResult}
        style={{ color: statusColor }}
      >
        {loading ? <Spinner /> : statusText}
      </span>
      <Button onClick={() => validateDomain()} disabled={loading}>
        Validate domain
      </Button>
    </div>
  );
}
