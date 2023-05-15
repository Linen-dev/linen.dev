import React, { useEffect, useState } from 'react';
import { FiX } from '@react-icons/all-files/fi/FiX';
import { FiGithub } from '@react-icons/all-files/fi/FiGithub';
import { CgLinear } from '@react-icons/all-files/cg/CgLinear';
import { FiMail } from '@react-icons/all-files/fi/FiMail';
import {
  channelsIntegrationType,
  Permissions,
  SerializedChannel,
} from '@linen/types';
import H3 from '@/H3';
import Modal from '@/Modal';
import Button from '@/Button';
import Toast from '@/Toast';
import { qs } from '@linen/utilities/url';
import { getLinenUrl } from '@linen/utilities/domain';
import type { ApiClient } from '@linen/api-client';
import styles from './index.module.scss';

interface IntegrationsModalProps {
  permissions: Permissions;
  open: boolean;
  close(): void;
  api: ApiClient;
  channel: SerializedChannel | null;
}

function IntegrationsModal({
  permissions,
  open,
  close,
  api,
  channel,
}: IntegrationsModalProps) {
  const [integration, setIntegration] = useState<any>();
  const [team, setTeam] = useState<any>();

  useEffect(() => {
    channel &&
      api
        .getChannelIntegrations({
          channelId: channel.id,
          accountId: channel.accountId!,
        })
        .then(setIntegration)
        .catch((e) => {
          if (process.env.NODE_ENV === 'development') {
            console.error(e);
          }
        });
  }, [channel]);

  useEffect(() => {
    if (integration) {
      const team = integration?.data?.teams?.find(
        (t: any) => t?.id === integration?.externalId
      );
      setTeam(team);
    }
  }, [integration]);

  const onLinearClick = async () => {
    if (!channel) {
      return;
    }
    await api
      .postChannelIntegrations({
        accountId: channel.accountId!,
        channelId: channel.id,
        type: channelsIntegrationType.LINEAR,
        data: {
          redirect_after: window.location.href,
        },
      })
      .then(({ id }) => {
        window.location.href = `${getLinenUrl()}/api/bridge/linear/setup?integrationId=${id}`;
      })
      .catch((e) => {
        Toast.error('Something went wrong');
      });
  };

  const onRemoveLinearClick = async () => {
    if (!channel) {
      return;
    }
    return emailUs({
      channelName: channel.channelName,
      accountId: channel.accountId,
      type: 'linear',
      action: 'Remove',
    });
  };

  const onGithubClick = async () => {
    if (!channel) {
      return;
    }
    return emailUs({
      channelName: channel.channelName,
      accountId: channel.accountId,
      type: 'github',
    });
  };

  const onRemoveGithubClick = async () => {
    if (!channel) {
      return;
    }
    return emailUs({
      channelName: channel.channelName,
      accountId: channel.accountId,
      type: 'github',
      action: 'Remove',
    });
  };

  const onEmailClick = async () => {
    if (!channel) {
      return;
    }
    return emailUs({
      channelName: channel.channelName,
      accountId: channel.accountId,
      type: 'email',
    });
  };

  const onRemoveEmailClick = async () => {
    if (!channel) {
      return;
    }
    return emailUs({
      channelName: channel.channelName,
      accountId: channel.accountId,
      type: 'email',
      action: 'Remove',
    });
  };

  return (
    <Modal open={open} close={close} size="md">
      <H3 className={styles['pb-4']}>Integration</H3>

      {permissions.manage && channel ? (
        <>
          {integration ? (
            <>
              {integration.type === 'LINEAR' && (
                <div className={styles['flex']}>
                  <div className={styles['flex-grow']}>
                    <div className={styles['flex-gap-1-items-center']}>
                      <CgLinear /> Linear
                    </div>
                    <div className={styles['flex-flex-col-text-sm']}>
                      <span>Project Name: {team?.name}</span>
                      <span>Project Key: {team?.key}</span>
                    </div>
                  </div>
                  <div className={styles['flex-items-center']}>
                    {Remove(onRemoveLinearClick)}
                  </div>
                </div>
              )}

              {integration.type === 'GITHUB' && (
                <div className={styles['flex']}>
                  <div className={styles['flex-grow']}>
                    <div className={styles['flex-gap-1-items-center']}>
                      <FiGithub /> Github
                    </div>
                    <div className={styles['flex-flex-col-text-sm']}>
                      <span>Owner: {integration?.data?.owner}</span>
                      <span>Repo: {integration?.data?.repo}</span>
                    </div>
                  </div>
                  <div className={styles['flex-items-center']}>
                    {Remove(onRemoveGithubClick)}
                  </div>
                </div>
              )}

              {integration.type === 'EMAIL' && (
                <div className={styles['flex']}>
                  <div className={styles['flex-grow']}>
                    <div className={styles['flex-gap-1-items-center']}>
                      <FiMail /> Email
                    </div>
                    <div className={styles['flex-flex-col-text-sm']}>
                      <span>Inbox: {integration?.data?.email}</span>
                    </div>
                  </div>
                  <div className={styles['flex-items-center']}>
                    {Remove(onRemoveEmailClick)}
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              <div className={styles['flex-gap-4-justify-around']}>
                <Button color="gray" onClick={onLinearClick}>
                  <CgLinear /> Linear
                </Button>
                <Button color="black" onClick={onGithubClick}>
                  <FiGithub /> Github
                </Button>
                <Button color="blue" onClick={onEmailClick}>
                  <FiMail /> Email
                </Button>
              </div>
            </>
          )}
        </>
      ) : (
        <>
          <span>Managers only</span>
        </>
      )}
    </Modal>
  );
}

function Remove(onClick: () => Promise<void>) {
  return (
    <span
      className={styles['flex-items-center-gap-1-text-xs-pl-4-cursor-pointer']}
      onClick={onClick}
    >
      <FiX /> Remove
    </span>
  );
}

function emailUs({
  channelName,
  accountId,
  type,
  action = 'Setup',
}: {
  channelName: string;
  accountId: string | null;
  type: 'email' | 'github' | 'linear';
  action?: 'Setup' | 'Remove';
}) {
  const params = {
    subject: `${action} ${type} integration`,
    body: `
Integration: ${type}
Channel: ${channelName}
Community: ${accountId}
`,
  };
  window.location.href = `mailto:help@linen.dev?${qs(params)}`;
}

function showLinearDetail(integration: any): React.ReactNode {
  const team = integration?.data?.teams?.find(
    (t: any) => t?.id === integration?.externalId
  );
  return team ? `${team.key} ${team.name}` : '';
}

function ShowIntegrationDetail({
  api,
  channel,
  isUserAuthenticated,
}: {
  api: ApiClient;
  channel: SerializedChannel | null;
  isUserAuthenticated: boolean;
}) {
  const [value, setValue] = useState<{ data: any; type: string }>();

  useEffect(() => {
    isUserAuthenticated &&
      channel &&
      api
        .getChannelIntegrations({
          channelId: channel.id,
          accountId: channel.accountId!,
        })
        .then(setValue)
        .catch((e) => {
          console.error(e);
        });
  }, [isUserAuthenticated, channel]);

  return (
    <>
      {value && (
        <span
          className={
            styles['text-xs-text-gray-400-flex-gap-1-pl-4-pr-1-items-center']
          }
        >
          {value.type === 'GITHUB' && (
            <>
              <FiGithub /> {value.data?.owner}/{value.data?.repo}
            </>
          )}
          {value.type === 'EMAIL' && (
            <>
              <FiMail /> {value.data?.email}
            </>
          )}
          {value.type === 'LINEAR' && (
            <>
              <CgLinear /> {showLinearDetail(value)}
            </>
          )}
        </span>
      )}
    </>
  );
}

export default {
  IntegrationsModal,
  ShowIntegrationDetail,
};
