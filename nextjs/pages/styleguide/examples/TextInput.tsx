import Example from '../Example';
import TextInput from '../../../components/TextInput';
import { AiOutlineSearch } from 'react-icons/ai';

export default function MessageExample() {
  return (
    <Example header="TextInput">
      <Example description="TextInput can have a label.">
        <TextInput label="Name" id="text-input-foo" />
      </Example>
      <Example description="TextInput can have an icon and a placeholder text.">
        <TextInput
          id="text-input-bar"
          icon={<AiOutlineSearch />}
          placeholder="Search"
        />
      </Example>
    </Example>
  );
}
