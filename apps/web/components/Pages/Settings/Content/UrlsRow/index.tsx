import { SerializedAccount } from '@linen/types'
import { Toast } from '@linen/ui';
import TextField from 'components/TextField';

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
      <div className="flex">
        <div className="grow">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            {title}
          </h3>
          <div className="mt-2 sm:flex sm:items-start sm:justify-between">
            <div className="max-w-xl text-sm text-gray-500">
              <p>{subtitle}</p>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-3">
        <TextField {...textFieldOptions} />
      </div>
    </>
  );
}

interface Props {
  currentCommunity: SerializedAccount
}

export default function URLs({ currentCommunity }: Props) {
  const onSubmit = (target: { id: string; value: string }) => {
    if (!target.id || !target.value) return;
    // @ts-ignore
    if (target.id in currentCommunity && currentCommunity[target.id] === target.value) return;
    fetch('/api/accounts', {
      method: 'PUT',
      body: JSON.stringify({
        communityId: currentCommunity.id,
        [target.id]: target.value,
      }),
    })
      .then((response) => {
        if (!response.ok) throw response;
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
        subtitle="Link to your home page."
        textFieldOptions={{
          placeholder: 'https://yourwebsite.com',
          id: 'homeUrl',
          defaultValue: currentCommunity.homeUrl || '',
          onBlur: (e: any) => onSubmit(e.target),
        }}
      />
      <hr className="my-3"/>
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
      <hr className="my-3"/>
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
