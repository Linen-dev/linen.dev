import React, { useState } from 'react';
import classNames from 'classnames';
import { FiBarChart } from '@react-icons/all-files/fi/FiBarChart';
import { FiMenu } from '@react-icons/all-files/fi/FiMenu';
import { FiHash } from '@react-icons/all-files/fi/FiHash';
import { FiInbox } from '@react-icons/all-files/fi/FiInbox';
import { FiLogOut } from '@react-icons/all-files/fi/FiLogOut';
import { FiZap } from '@react-icons/all-files/fi/FiZap';
import { FiSliders } from '@react-icons/all-files/fi/FiSliders';
import { FiUsers } from '@react-icons/all-files/fi/FiUsers';
import { FiFileText } from '@react-icons/all-files/fi/FiFileText';
import Modal from '@/Modal';
import styles from './index.module.scss';
import { Permissions, SerializedChannel } from '@linen/types';
import { FiStar } from '@react-icons/all-files/fi/FiStar';
import { FiLayers } from '@react-icons/all-files/fi/FiLayers';

interface Props {
  channels: SerializedChannel[];
  channelName?: string;
  fontColor: string;
  permissions: Permissions;
  InternalLink: (args: any) => JSX.Element;
  routerAsPath: string;
  signOut: () => void;
  usePath: (args: { href: string }) => string;
}

export default function MobileMenu({
  channels,
  channelName,
  permissions,
  fontColor,
  InternalLink,
  routerAsPath,
  signOut,
  usePath,
}: Props) {
  const [show, setOpen] = useState(false);
  const open = () => setOpen(true);
  const close = () => setOpen(false);

  const paths = {
    inbox: usePath({ href: '/inbox' }),
    starred: usePath({ href: '/starred' }),
    all: usePath({ href: '/all' }),
    metrics: usePath({ href: '/metrics' }),
    configurations: usePath({ href: '/configurations' }),
    branding: usePath({ href: '/branding' }),
    members: usePath({ href: '/members' }),
    plans: usePath({ href: '/plans' }),
  };

  return (
    <>
      <FiMenu
        className={styles.open}
        style={{ color: fontColor }}
        onClick={open}
      />
      <Modal open={show} close={close} fullscreen>
        <div className={styles.content}>
          <div className={styles.header}>
            <div className={styles.text}>Menu</div>
            <FiMenu className={styles.close} onClick={close} />
          </div>
          <ul className={styles.list}>
            {permissions.inbox && (
              <li>
                <InternalLink
                  onClick={close}
                  className={classNames(styles.link, {
                    [styles.active]: paths.inbox === routerAsPath,
                  })}
                  href="/inbox"
                >
                  <FiInbox /> Inbox
                </InternalLink>
              </li>
            )}
            {permissions.starred && (
              <li>
                <InternalLink
                  onClick={close}
                  className={classNames(styles.link, {
                    [styles.active]: paths.starred === routerAsPath,
                  })}
                  href="/starred"
                >
                  <FiStar /> Starred
                </InternalLink>
              </li>
            )}
            {permissions.user && (
              <li>
                <InternalLink
                  onClick={close}
                  className={classNames(styles.link, {
                    [styles.active]: paths.all === routerAsPath,
                  })}
                  href="/all"
                >
                  <FiLayers /> All
                </InternalLink>
              </li>
            )}
            {permissions.manage && (
              <li>
                <InternalLink
                  onClick={close}
                  className={classNames(styles.link, {
                    [styles.active]: paths.configurations === routerAsPath,
                  })}
                  href="/configurations"
                >
                  <FiFileText /> Configurations
                </InternalLink>
              </li>
            )}
            {permissions.manage && (
              <li>
                <InternalLink
                  onClick={close}
                  className={classNames(styles.link, {
                    [styles.active]: paths.branding === routerAsPath,
                  })}
                  href="/branding"
                >
                  <FiSliders /> Branding
                </InternalLink>
              </li>
            )}
            {permissions.manage && (
              <li>
                <InternalLink
                  onClick={close}
                  className={classNames(styles.link, {
                    [styles.active]: paths.members === routerAsPath,
                  })}
                  href="/members"
                >
                  <FiUsers /> Members
                </InternalLink>
              </li>
            )}
            {permissions.manage && (
              <li>
                <InternalLink
                  onClick={close}
                  className={classNames(styles.link, {
                    [styles.active]: paths.plans === routerAsPath,
                  })}
                  href="/plans"
                >
                  <FiZap /> Plans
                </InternalLink>
              </li>
            )}
            <li className={styles.subheader}>Channels</li>
            {channels
              .sort((a, b) => a.channelName.localeCompare(b.channelName))
              .map((channel, index) => {
                return (
                  <li key={channel.channelName + index}>
                    <InternalLink
                      className={classNames(styles.link, {
                        [styles.active]: channel.channelName === channelName,
                      })}
                      onClick={close}
                      href={`/c/${channel.channelName}`}
                    >
                      <FiHash /> {channel.channelName}
                    </InternalLink>
                  </li>
                );
              })}

            {permissions.manage && (
              <li className={styles.subheader}>Analytics</li>
            )}
            {permissions.manage && (
              <li>
                <InternalLink
                  onClick={close}
                  className={classNames(styles.link, {
                    [styles.active]: paths.metrics === routerAsPath,
                  })}
                  href="/metrics"
                >
                  <FiBarChart /> Metrics
                </InternalLink>
              </li>
            )}
            {permissions.user && permissions.is_member && (
              <li className={styles.subheader}>Actions</li>
            )}
            {permissions.user && permissions.is_member && (
              <li
                onClick={() => {
                  close();
                  signOut();
                }}
                className={styles.link}
              >
                <FiLogOut /> Sign Out
              </li>
            )}
          </ul>
        </div>
      </Modal>
    </>
  );
}
