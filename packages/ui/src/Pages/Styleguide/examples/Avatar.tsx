import React from 'react';
import Example from '../Example';
import Avatar from '../../../Avatar';

export default function AvatarExample() {
  return (
    <Example header="Avatar">
      <Example description="Avatars can have text" inline>
        {'abcdefghijklmnopqrstuvwxyz'.split('').map((letter) => (
          <Avatar text={letter} />
        ))}
      </Example>
    </Example>
  );
}
