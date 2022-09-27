import Example from '../Example';
import Suggestions from 'components/Suggestions';

export default function SuggestionsExample() {
  return (
    <Example header="Suggestions">
      <Example description="Suggestions have a display name.">
        <Suggestions
          fetch={() =>
            new Promise((resolve) =>
              setTimeout(() => {
                resolve([
                  {
                    id: '@john',
                    displayName: 'John Doe',
                    externalUserId: null,
                    profileImageUrl: null,
                  },
                  {
                    id: '@jim',
                    displayName: 'Jim Jam',
                    externalUserId: null,
                    profileImageUrl: null,
                  },
                  {
                    id: '@meghan',
                    displayName: 'Meghan Yu',
                    externalUserId: null,
                    profileImageUrl: null,
                  },
                ]);
              }, 250)
            )
          }
        />
      </Example>
    </Example>
  );
}
