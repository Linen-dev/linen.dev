import Example from '../Example';
import Suggestions from 'components/Suggestions';

export default function SuggestionsExample() {
  return (
    <Example header="Suggestions">
      <Example description="Suggestions have a display name.">
        <Suggestions
          users={[
            {
              id: '1',
              username: 'john.doe',
              displayName: 'John Doe',
              externalUserId: null,
              profileImageUrl: null,
            },
            {
              id: '2',
              username: 'jim.jam',
              displayName: 'Jim Jam',
              externalUserId: null,
              profileImageUrl: null,
            },
            {
              id: '3',
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
