import Example from '../Example';
import Suggestions from 'components/Suggestions';

export default function SuggestionsExample() {
  return (
    <Example header="Suggestions">
      <Example description="Suggestions have a username and an optional name.">
        <Suggestions
          users={[
            { username: '@john', name: 'John Doe' },
            { username: '@jim', name: 'Jim Jam' },
            { username: '@meghan' },
          ]}
        />
      </Example>
    </Example>
  );
}
