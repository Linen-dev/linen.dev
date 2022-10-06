import { toast } from 'components/Toast';
import TextField from 'components/TextField';
import { SettingsProps } from '..';

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
    <div className="bg-white">
      <div className="px-4 py-5 sm:p-6">
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
      </div>
    </div>
  );
}

export default function URLs({ account }: SettingsProps) {
  const onSubmit = (target: { id: string; value: string }) => {
    if (!account) return;
    if (!target.id || !target.value) return;
    // @ts-ignore
    if (target.id in account && account[target.id] === target.value) return;
    fetch('/api/accounts', {
      method: 'PUT',
      body: JSON.stringify({
        [target.id]: target.value,
      }),
    })
      .then((response) => {
        if (!response.ok) throw response;
        // @ts-ignore
        account[target.id] = target.value;
      })
      .catch(() => {
        toast.error('Something went wrong!');
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
          defaultValue: account?.homeUrl || '',
          onBlur: (e: any) => onSubmit(e.target),
        }}
      />
      <URLsCard
        title="Docs URL"
        subtitle="Link to your documentation."
        textFieldOptions={{
          placeholder: 'https://docs.yourwebsite.com',
          id: 'docsUrl',
          defaultValue: account?.docsUrl || '',
          onBlur: (e: any) => onSubmit(e.target),
        }}
      />
      <URLsCard
        title="Community Invitation URL"
        subtitle="Link to your community invite."
        textFieldOptions={{
          placeholder: 'https://yourwebsite.com/community-invite',
          id: 'communityInviteUrl',
          defaultValue: account?.communityInviteUrl || '',
          onBlur: (e: any) => onSubmit(e.target),
        }}
      />
    </>
  );
}
