import React from 'react';
import Picker from '@emoji-mart/react';
import styles from './index.module.scss';

interface Props {
  onSelect(emoji: any): void;
}

export default function EmojiPicker({ onSelect }: Props) {
  return (
    <div className={styles.container}>
      <Picker
        data={async () => {
          const response = await fetch(
            'https://cdn.jsdelivr.net/npm/@emoji-mart/data'
          );
          return response.json();
        }}
        onEmojiSelect={onSelect}
        previewPosition="none"
        searchPosition="none"
        dynamicWidth
      />
    </div>
  );
}
