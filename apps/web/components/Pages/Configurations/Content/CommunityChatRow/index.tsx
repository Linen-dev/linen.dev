import React, { useState } from 'react';
import { ChatType } from '@linen/types';
import Row from '../Row';
import { NativeSelect } from '@linen/ui';
import { RiChatCheckLine, RiChatDeleteLine } from 'react-icons/ri';

interface Props {
  chat: ChatType | null;
  disabled: boolean;
  onChange(chat: ChatType): void;
}

function description(chat: ChatType) {
  switch (chat) {
    case ChatType.MANAGERS:
      return 'Your community chat is restricted. Only managers can chat.';
    case ChatType.MEMBERS:
      return 'Your community chat is public. Anyone can join your community and chat.';
    case ChatType.NONE:
      return 'Your community chat is disabled.';
  }
}

function icon(chat: ChatType) {
  switch (chat) {
    case ChatType.MANAGERS:
      return <RiChatCheckLine />;
    case ChatType.MEMBERS:
      return <RiChatCheckLine />;
    case ChatType.NONE:
      return <RiChatDeleteLine />;
  }
}

export default function CommunityChatRow({
  chat: initialChat,
  onChange,
}: Props) {
  const [chat, setChat] = useState(initialChat || ChatType.NONE);
  return (
    <Row
      header="Community chat"
      description={description(chat)}
      action={
        <>
          <NativeSelect
            id="chat"
            icon={icon(chat)}
            theme="blue"
            options={[
              { label: 'Managers', value: ChatType.MANAGERS },
              { label: 'Members', value: ChatType.MEMBERS },
              { label: 'Disabled', value: ChatType.NONE },
            ]}
            defaultValue={chat}
            onChange={(event: React.SyntheticEvent) => {
              const node = event.target as HTMLSelectElement;
              const chat = node.value as ChatType;
              setChat(chat);
              onChange(chat);
            }}
          />
        </>
      }
    />
  );
}
