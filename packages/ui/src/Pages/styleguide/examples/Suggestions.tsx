import React from 'react';
import Example from '../Example';
import { Suggestions } from '@linen/ui';

export default function SuggestionsExample() {
  return (
    <Example header="Suggestions">
      <Example description="Suggestions have a display name.">
        <Suggestions
          users={[
            {
              id: '1',
              authsId: '1x',
              username: 'john.doe',
              displayName: 'John Doe',
              externalUserId: null,
              profileImageUrl: null,
            },
            {
              id: '2',
              authsId: '2x',
              username: 'jim.jam',
              displayName: 'Jim Jam',
              externalUserId: null,
              profileImageUrl: null,
            },
            {
              id: '3',
              authsId: '3x',
              username: 'meghan.yu',
              displayName: 'Meghan Yu',
              externalUserId: null,
              profileImageUrl: null,
            },
          ]}
        />
      </Example>
    </Example>
  );
}
