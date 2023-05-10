import Button from '@linen/ui/Button';
import Label from '@linen/ui/Label';
import Badge from '@linen/ui/Badge';
import TextInput from '@linen/ui/TextInput';
import Toast from '@linen/ui/Toast';
import { useState } from 'react';
import { patterns } from '@linen/types';
import { slugify } from '@linen/utilities/string';
import { FiX } from '@react-icons/all-files/fi/FiX';
import { FiPlus } from '@react-icons/all-files/fi/FiPlus';
import { FiHash } from '@react-icons/all-files/fi/FiHash';
import { FiUser } from '@react-icons/all-files/fi/FiUser';

interface Props {
  createAccount({
    name,
    slackDomain,
    channels,
    members,
  }: {
    name: string;
    slackDomain: string;
    channels: string[];
    members: string[];
  }): Promise<any>;
}

export default function Form({ createAccount }: Props) {
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

      const response = await createAccount({
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
          <span className="text-xs font-normal text-gray-700 dark:text-gray-200">
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
        <div className="p-2"></div>

        <Label htmlFor="slackDomain">
          Path
          <br />
          <span className="text-xs font-normal text-gray-700 dark:text-gray-200">
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
        <div className="p-2"></div>

        <Label htmlFor="channelName">
          Channels
          <br />
          <span className="text-xs font-normal text-gray-700 dark:text-gray-200">
            Lowercased letters, underscores, numbers and hyphens.
          </span>
        </Label>
        <div className="flex flex-wrap">
          {channels?.map((channel) => {
            return (
              <div className="pr-1 pb-1" key={channel}>
                <Badge onClick={() => removeChannel(channel)}>
                  <FiHash /> {channel} <FiX />
                </Badge>
              </div>
            );
          })}
        </div>
        <div className="flex gap-2">
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
          <Button style={{ marginBottom: 0 }} onClick={() => addChannel()}>
            Add <FiPlus />
          </Button>
        </div>
        <div className="p-2"></div>

        <Label htmlFor="email">
          Members
          <br />
          <span className="text-xs font-normal text-gray-700 dark:text-gray-200">
            Send invitations via email.
          </span>
        </Label>
        <div className="flex flex-wrap">
          {emails?.map((email) => {
            return (
              <div className="pr-1 pb-1" key={email}>
                <Badge onClick={() => removeEmail(email)}>
                  <FiUser />
                  {email} <FiX />
                </Badge>
              </div>
            );
          })}
        </div>
        <div className="flex w-full gap-2">
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
          <Button style={{ marginBottom: 0 }} onClick={() => addEmail()}>
            Add <FiPlus />
          </Button>
        </div>
        <div className="pb-8"></div>

        <Button
          style={{ width: '100% ' }}
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
