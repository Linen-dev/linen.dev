import { SerializedAccount } from '@linen/types';
import Toast from '@linen/ui/Toast';
import TextField from '@linen/ui/TextField';
import * as api from 'utilities/requests';

function URLsCard({
  title,
  subtitle,
  textFieldOptions,
}: {
  title: string;
  subtitle: string;
  textFieldOptions: any;
}) {
  return (
    <>
      <div className="flex gap-4">
        <div className="flex-1">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            {title}
          </h3>
          <div className="mt-2 sm:flex sm:items-start sm:justify-between">
            <div className="max-w-xl text-sm text-gray-500">
              <p>{subtitle}</p>
            </div>
          </div>
        </div>
        <div className="flex-1 m-auto">
          <TextField {...textFieldOptions} />
        </div>
      </div>
    </>
  );
}

interface Props {
  currentCommunity: SerializedAccount;
}

export default function URLs({ currentCommunity }: Props) {
  const onSubmit = (target: { id: string; value: string }) => {
    if (!target.id || !target.value) return;
    if (
      target.id in currentCommunity &&
      // @ts-ignore
      currentCommunity[target.id] === target.value
    )
      return;
    api
      .updateAccount({
        accountId: currentCommunity.id,
        [target.id]: target.value,
      })
      .then((_) => {
        // @ts-ignore
        currentCommunity[target.id] = target.value;
      })
      .catch(() => {
        Toast.error('Something went wrong!');
      });
  };

  return (
    <>
      <URLsCard
        title="Home URL"
        subtitle="Link to your home page. When users clicks on your logo this is the link they go to."
        textFieldOptions={{
          placeholder: 'https://yourwebsite.com',
          id: 'homeUrl',
          defaultValue: currentCommunity.homeUrl || '',
          onBlur: (e: any) => onSubmit(e.target),
        }}
      />
      <hr className="my-3" />
      <URLsCard
        title="Docs URL"
        subtitle="Link to your documentation."
        textFieldOptions={{
          placeholder: 'https://docs.yourwebsite.com',
          id: 'docsUrl',
          defaultValue: currentCommunity.docsUrl || '',
          onBlur: (e: any) => onSubmit(e.target),
        }}
      />
      <hr className="my-3" />
      <URLsCard
        title="Community Invitation URL"
        subtitle="Link to your community invite."
        textFieldOptions={{
          placeholder: 'https://yourwebsite.com/community-invite',
          id: 'communityInviteUrl',
          defaultValue: currentCommunity.communityInviteUrl || '',
          onBlur: (e: any) => onSubmit(e.target),
        }}
      />
    </>
  );
}
