import { Button, TextInput, Toast, Label } from '@linen/ui';
import { useState } from 'react';
import * as api from 'utilities/requests';
import { createSlug, patterns } from 'utilities/util';
import unique from 'lodash.uniq';
import { Badge } from 'components/Badge';

export default function Form() {
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
        window.location.href = `/s/${slackDomain}/integrations`;
      }
    } catch (error: any) {
      Toast.error(error.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  async function addChannel() {
    const input = document.getElementById(
      'new-channel-name'
    ) as HTMLInputElement;
    if (input.value && input.checkValidity()) {
      const channelName = input.value.toLowerCase();
      setChannels((channels) => unique([...channels, channelName]));
      input.value = '';
    } else {
      return input.reportValidity();
    }
  }

  async function addEmail() {
    const e = document.getElementById('email') as HTMLInputElement;
    if (!!e.value && e.checkValidity()) {
      setEmails(unique([...emails, e.value]));
      e.value = '';
    } else {
      return e.reportValidity();
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
          placeholder="Community name"
          required
          type="text"
          {...{
            pattern: patterns.communityName.source,
            title:
              "Community name should only contain letters, space and apostrophe. e.g. Linen's Community",
          }}
          onBlur={(e: React.FocusEvent<HTMLInputElement, Element>) =>
            e.target.value && setSuggestion(createSlug(e.target.value))
          }
        />
        <span className="text-xs">
          Community name should only contain letters, space and apostrophe. e.g.
          Linen&apos;s Community
        </span>
        <div className="p-4"></div>

        <TextInput
          id="slackDomain"
          placeholder="E.g. cool-community"
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
        <span className="text-xs">
          Community path will define the url to access your community. e.g.
          https://linen.dev/s/cool-community
        </span>
        <div className="p-4"></div>

        <Label htmlFor="channelName">Add channels to your workspace</Label>
        <div className="flex flex-wrap">
          {channels?.map((channel) => {
            return (
              <div className="pr-1 pb-1" key={channel}>
                <Badge onClose={() => removeChannel(channel)}>{channel}</Badge>
              </div>
            );
          })}
        </div>
        <div className="flex gap-2">
          <TextInput
            id="new-channel-name"
            placeholder="E.g. new-channel"
            {...{
              pattern: patterns.channelName.source,
              title:
                'Channels name should start with lower case letter and could contain lower case letters, underscore, numbers and hyphens. e.g. announcements',
            }}
          />
          <Button onClick={() => addChannel()}>+</Button>
        </div>
        <span className="text-xs">
          Channels name should contain letter, underscore, numbers and hyphens.
          e.g. announcements
        </span>
        <div className="p-4"></div>

        <Label htmlFor="email">Invite members from your team</Label>
        <div className="flex flex-wrap">
          {emails?.map((email) => {
            return (
              <div className="pr-1 pb-1" key={email}>
                <Badge onClose={() => removeEmail(email)}>{email}</Badge>
              </div>
            );
          })}
        </div>
        <div className="flex w-full gap-2">
          <TextInput id="email" type="email" placeholder="name@team.com" />
          <Button onClick={() => addEmail()}>+</Button>
        </div>
        <div className="p-4"></div>

        <Button type="submit" block disabled={loading}>
          {loading ? 'Loading...' : 'Create your new community'}
        </Button>
      </form>
    </>
  );
}
