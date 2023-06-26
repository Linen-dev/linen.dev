import React from 'react';
import Picker from '@emoji-mart/react';

interface Props {
  onSelect(emoji: any): void;
}

export default function EmojiPicker({ onSelect }: Props) {
  return (
    <Picker
      data={async () => {
        const response = await fetch(
          'https://cdn.jsdelivr.net/npm/@emoji-mart/data'
        );
        return response.json();
      }}
      onEmojiSelect={onSelect}
    />
  );
}
