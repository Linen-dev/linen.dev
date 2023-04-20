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
        <TextInput
          id="name"
          label="Community name"
          required
          type="text"
          title="Community name should only contain letters, space and apostrophe. e.g. Linen's Community"
          pattern={patterns.communityName.source}
          onChange={(event: React.FocusEvent<HTMLInputElement, Element>) => {
            const name = event.target.value;
            setSuggestion(name ? slugify(name) : '');
          }}
        />
        <span className="text-xs text-gray-700">
          Community name should only contain letters, space and apostrophe. e.g.
          Linen&apos;s Community
        </span>
        <div className="p-4"></div>

        <TextInput
          id="slackDomain"
          placeholder="cool-community"
          label="What should be your community path?"
          {...{
            pattern: patterns.communityPath.source,
            required: true,
            title:
              'Community path should start with lower case letter and could contain lower case letters, underscore, numbers and hyphens. e.g. linen-community',
          }}
          value={suggestion}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setSuggestion(e.target.value)
          }
        />
        <span className="text-xs text-gray-700">
          Community path will define the url to access your community.
          <br />
          https://linen.dev/s/{suggestion || 'cool-community'}
        </span>
        <div className="p-4"></div>

        <Label htmlFor="channelName">Add channels to your workspace</Label>
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
            {...{
              pattern: patterns.channelName.source,
              title:
                'Channels name should start with lower case letter and could contain lower case letters, underscore, numbers and hyphens. e.g. announcements',
            }}
            onKeyDown={(event: React.KeyboardEvent<HTMLInputElement>) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                event.stopPropagation();
                addChannel();
              }
            }}
          />
          <Button onClick={() => addChannel()}>
            Add <FiPlus />
          </Button>
        </div>
        <span className="text-xs text-gray-700">
          Channels name should contain letter, underscore, numbers and hyphens.
          e.g. announcements
        </span>
        <div className="p-4"></div>

        <Label htmlFor="email">Invite members from your team</Label>
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
          <Button onClick={() => addEmail()}>
            Add <FiPlus />
          </Button>
        </div>
        <div className="pb-4"></div>

        <Button type="submit" disabled={loading}>
          Create your new community
        </Button>
      </form>
    </>
  );
}
