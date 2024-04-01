import React, { useState } from 'react';
import Label from '@/Label';
import { SerializedAccount } from '@linen/types';
import ApiKeysModal from '@/ApiKeysModal';
import Button from '@/Button';

interface Props {
  currentCommunity: SerializedAccount;
}

export default function ApiKeys({ currentCommunity }: Props) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Label htmlFor="api-keys">
        Api Keys
        <Label.Description>
          Api Keys are used for integrations like Matrix, custom API, etc.
        </Label.Description>
      </Label>
      <Button
        onClick={() => {
          setOpen(true);
        }}
      >
        Manage
      </Button>
      <ApiKeysModal
        accountId={currentCommunity.id}
        close={() => setOpen(false)}
        open={open}
      />
    </>
  );
}
