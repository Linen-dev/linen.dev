import React, { useState } from 'react';
import Button from '@/Button';
import Label from '@/Label';
import Badge from '@/Badge';
import TextInput from '@/TextInput';
import Toast from '@/Toast';
import { patterns } from '@linen/types';
import { slugify } from '@linen/utilities/string';
import { FiX } from '@react-icons/all-files/fi/FiX';
import { FiPlus } from '@react-icons/all-files/fi/FiPlus';
import { FiHash } from '@react-icons/all-files/fi/FiHash';
import { FiUser } from '@react-icons/all-files/fi/FiUser';
import type { ApiClient } from '@linen/api-client';
import styles from './index.module.scss';

interface Props {
  api: ApiClient;
}

export default function OnboardingForm({ api }: Props) {
  const [loading, setLoading] = useState(false);
  const [channels, setChannels] = useState<string[]>([]);
  const [emails, setEmails] = useState<string[]>([]);
  const [suggestion, setSuggestion] = useState<string>('');

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    try {
      const target = e.target as typeof e.target & {
        name: { value: string };
        slackDomain: { value: string };
      };
      const name = target.name.value;
      const slackDomain = target.slackDomain.value.toLowerCase();

      const response = await api.createAccount({
        name,
        slackDomain,
        channels,
        members: emails,
      });
      if (response.id) {
        window.location.href = `/s/${slackDomain}/configurations`;
      }
    } catch (error: any) {
      Toast.error(error.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  async function addChannel() {
    const input = document.getElementById(
      'new-channel-onboarding'
    ) as HTMLInputElement;
    if (input.value && input.checkValidity()) {
      const channel = input.value.toLowerCase();
      if (channels.includes(channel)) {
        Toast.error('Channel already added.');
      } else {
        setChannels((channels) => [...channels, channel]);
        input.value = '';
      }
    } else {
      return input.reportValidity();
    }
  }

  async function addEmail() {
    const input = document.getElementById(
      'new-email-onboarding'
    ) as HTMLInputElement;
    if (input.value && input.checkValidity()) {
      const email = input.value;
      if (emails.includes(email)) {
        Toast.error('Email already added.');
      } else {
        setEmails((emails) => [...emails, email]);
        input.value = '';
      }
    } else {
      return input.reportValidity();
    }
  }

  function removeChannel(channel: string) {
    setChannels(channels.filter((c) => c !== channel));
  }

  function removeEmail(email: string) {
    setEmails(emails.filter((e) => e !== email));
  }

  return (
    <>
      <form onSubmit={onSubmit} id="form">
        <Label htmlFor="name">
          Name
          <br />
          <span className={styles.subtitle}>
            Letters, spaces and apostrophes.
          </span>
        </Label>
        <TextInput
          id="name"
          required
          type="text"
          title="Letters, spaces and apostrophes."
          pattern={patterns.communityName.source}
          onChange={(event: React.FocusEvent<HTMLInputElement, Element>) => {
            const name = event.target.value;
            setSuggestion(name ? slugify(name) : '');
          }}
        />
        <div className={styles.p2}></div>

        <Label htmlFor="slackDomain">
          Path
          <br />
          <span className={styles.subtitle}>
            https://linen.dev/s/
            {suggestion || 'community-path'}
          </span>
        </Label>
        <TextInput
          id="slackDomain"
          required
          pattern={patterns.communityPath.source}
          title="Lowercased letters, underscores, numbers and hyphens."
          value={suggestion}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setSuggestion(e.target.value)
          }
        />
        <div className={styles.p2}></div>

        <Label htmlFor="channelName">
          Channels
          <br />
          <span className={styles.subtitle}>
            Lowercased letters, underscores, numbers and hyphens.
          </span>
        </Label>
        <div className={styles.flexWrap}>
          {channels?.map((channel) => {
            return (
              <div className={styles.badgeWrapper} key={channel}>
                <Badge onClick={() => removeChannel(channel)}>
                  <FiHash /> {channel} <FiX />
                </Badge>
              </div>
            );
          })}
        </div>
        <div className={styles.flexGap2}>
          <TextInput
            id="new-channel-onboarding"
            placeholder="general"
            icon={<FiHash />}
            pattern={patterns.channelName.source}
            title="Lowercased letters, underscores, numbers and hyphens."
            onKeyDown={(event: React.KeyboardEvent<HTMLInputElement>) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                event.stopPropagation();
                addChannel();
              }
            }}
          />
          <Button className={styles.mb0} onClick={() => addChannel()}>
            Add <FiPlus />
          </Button>
        </div>
        <div className={styles.p2}></div>

        <Label htmlFor="email">
          Members
          <br />
          <span className={styles.subtitle}>Send invitations via email.</span>
        </Label>
        <div className={styles.flexWrap}>
          {emails?.map((email) => {
            return (
              <div className={styles.badgeWrapper} key={email}>
                <Badge onClick={() => removeEmail(email)}>
                  <FiUser />
                  {email} <FiX />
                </Badge>
              </div>
            );
          })}
        </div>
        <div className={styles.flexGap2Full}>
          <TextInput
            id="new-email-onboarding"
            type="email"
            placeholder={`user@${suggestion || 'domain'}.com`}
            icon={<FiUser />}
            onKeyDown={(event: React.KeyboardEvent<HTMLInputElement>) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                event.stopPropagation();
                addEmail();
              }
            }}
          />
          <Button className={styles.mb0} onClick={() => addEmail()}>
            Add <FiPlus />
          </Button>
        </div>
        <div className={styles.pb8}></div>

        <Button
          className={styles.btn}
          type="submit"
          disabled={loading}
          weight="medium"
        >
          <FiPlus /> Create your community
        </Button>
      </form>
    </>
  );
}
