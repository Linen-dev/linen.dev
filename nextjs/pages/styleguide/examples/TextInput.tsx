import Example from '../Example';
import TextInput from '../../../components/TextInput';

export default function MessageExample() {
  return (
    <Example header="TextInput">
      <Example description="Standard">
        <TextInput id="text-input-foo" />
      </Example>
    </Example>
  );
}
