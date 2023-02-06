import { Button } from '@linen/ui';
import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Image } from '@linen/ui';
import { Message } from '@linen/ui';
import { MessageFormat } from '@linen/database';
import TextField from 'components/TextField';
import { Label } from '@linen/ui';

export type onSubmitType = {
  discordServerId: string;
  botToken: string;
};

export function RightPanel({
  open,
  setOpen,
  loading,
  onSubmit,
  discordServerId,
}: {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  loading: boolean;
  onSubmit: (e: onSubmitType) => Promise<void>;
  discordServerId?: string;
}) {
  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={setOpen}>
        <div className="fixed inset-0" />
        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10 sm:pl-16">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-in-out duration-500 sm:duration-700"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-500 sm:duration-700"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <Dialog.Panel className="pointer-events-auto w-screen max-w-4xl">
                  <Instructions
                    {...{ setOpen, loading, onSubmit, discordServerId }}
                  />
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}

function Instructions({
  setOpen,
  loading,
  onSubmit,
  discordServerId,
}: {
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  loading: boolean;
  onSubmit: (e: onSubmitType) => Promise<void>;
  discordServerId?: string;
}) {
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const form = e.target as any;
    const discordServerId = form.discordServerId.value;
    const botToken = form.botToken.value;
    await onSubmit({ discordServerId, botToken });
  };

  return (
    <form
      className="flex h-full flex-col divide-y divide-gray-200 bg-white shadow-xl"
      onSubmit={handleSubmit}
    >
      <div className="h-0 flex-1 overflow-y-auto">
        <div className="flex flex-1 flex-col justify-between py-6">
          <div className="divide-y divide-gray-200 px-4 sm:px-6 gap-0">
            {html.map((row) =>
              row.startsWith('https://') ? (
                <div className="flex justify-center" key={row}>
                  <Image src={row} alt={row} className="p-4 w-auto max-h-40" />
                </div>
              ) : (
                <Message format={MessageFormat.LINEN} text={row} key={row} />
              )
            )}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-6 gap-4 p-4">
        <div className="col-span-6 sm:col-span-3">
          <Label htmlFor="discordServerId">Server ID</Label>
          <TextField
            placeholder="Paste your server ID (guild ID)"
            id="discordServerId"
            {...{
              minLength: 1,
            }}
            required
            defaultValue={discordServerId}
          />
        </div>
        <div className="col-span-6 sm:col-span-3">
          <Label htmlFor="botToken">Bot Token</Label>
          <TextField
            placeholder="Paste your bot's token"
            id="botToken"
            {...{
              minLength: 1,
            }}
            required
          />
        </div>
      </div>

      <div className="flex flex-shrink-0 justify-end px-4 py-4">
        <Button color="transparent" onClick={() => setOpen(false)}>
          Cancel
        </Button>
        <Button disabled={loading} type="submit">
          {!loading ? 'Save' : 'Loading...'}
        </Button>
      </div>
    </form>
  );
}

const html = [
  `#### Creating your bot
  

1. Open the [Discord developer portal](https://discord.com/developers/applications) and log into your account.
2. Click on the "New Application" button.
3. Enter a name and confirm the pop-up window by clicking the "Create" button.

You should see a page like this:
`,
  `https://linen-assets.s3.amazonaws.com/guide/create-app.png`,
  `
You can edit your application's name, description, and avatar here. Once you've saved your changes, move on by selecting the "Bot" tab in the left pane.
`,
  `https://linen-assets.s3.amazonaws.com/guide/create-bot.png`,
  `
Click the "Add Bot" button on the right and confirm the pop-up window by clicking "Yes, do it!".

#### Your bot's token

After creating a bot user, you'll see a section like this:
`,
  `https://linen-assets.s3.amazonaws.com/guide/created-bot.png`,
  `
In this panel, you can give your bot an avatar, set its username, and make it public or private. Your bot's token will be revealed when you press the "Reset Token" button and confirm.

> If you happen to lose your bot's token at some point, you need to come back to this page and reset your bot's token again which will reveal the new token, invalidating all old ones.

#### Privileged Intents

To enable privileged intents, select the "Bot" tab in the left pane then scroll down to the "Privileged Gateway Intents" section. Linen will need at least the following intents:


- Server Members Intent 
- Message Content Intent 
`,
  `https://linen-assets.s3.amazonaws.com/guide/privileged-gateway-intents.png`,
  `
#### Adding your bot to servers

Before you're able to see your bot in your own servers, you'll need to add it by creating and using a unique invite link using your bot application's client id.

#### Creating and using your invite link

In the sidebar, under the "OAuth2" section, you'll find the OAuth2 URL generator. Select the \`bot\` option. Once you select the \`bot\` option, a list of permissions will appear. Linen will need at least the following permissions:


- View Channels  
- Read Message History

Grab the link via the "Copy" button and enter it in your browser. You should see something like this (with your bot's username and avatar):
`,
  `https://linen-assets.s3.amazonaws.com/guide/bot-auth-page.png`,
  `
Choose the server you want to add it to and click "Authorize". Do note that you'll need the "Manage Server" permission on a server to add your bot there. This should then present you a nice confirmation message:
`,
  `https://linen-assets.s3.amazonaws.com/guide/bot-authorized.png`,
  `
It should show up in your server's member list somewhat like this:
`,
  `https://linen-assets.s3.amazonaws.com/guide/bot-in-memberlist.png`,
  `
#### Find your Guild ID (Server ID)

You will need the full Server ID (not the name) to continue. Follow these steps to find your Server ID:
  
1. In Discord, open your "User Settings" by clicking the Settings Gear next to your user name on the bottom.
2. Go to "App Settings" and enable "Developer Mode" under the "Advanced" section, then close "User Settings".
3. Open your Discord server, right-click on the server name, then select "Copy ID"
4. Paste the Server ID here on Linen
5. If desired, you can disable "Developer Mode" now.
`,
];
