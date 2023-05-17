import React from 'react';
import Example from '../Example';
import Avatar from '@/Avatar';

export default function AvatarExample() {
  return (
    <Example header="Avatar">
      <Example description="Avatars can have text." inline>
        {'abcdefghijklmnopqrstuvwxyz'.split('').map((letter) => (
          <Avatar text={letter} />
        ))}
      </Example>
      <Example description="Avatars can have images." inline>
        <Avatar src="https://static.main.linendev.com/logos/logo05dab315-0b75-415b-aca4-f56a1867f045.png" />
      </Example>
    </Example>
  );
}
