import React from 'react';
import Toast from '@linen/ui/Toast';
import TextField from '@linen/ui/TextField';
import Label from '@linen/ui/Label';
import { api } from 'utilities/requests';
import { SerializedAccount } from '@linen/types';

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
      <Label htmlFor={textFieldOptions.id}>
        {title}
        <Label.Description>{subtitle}</Label.Description>
      </Label>
      <TextField {...textFieldOptions} />
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
    </>
  );
}
