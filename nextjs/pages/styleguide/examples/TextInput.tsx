import Example from '../Example';
import TextInput from '../../../components/TextInput';
import { AiOutlineSearch } from 'react-icons/ai';

export default function MessageExample() {
  return (
    <Example header="TextInput">
      <Example description="Standard">
        <TextInput id="text-input-foo" />
        <TextInput
          id="text-input-bar"
          icon={<AiOutlineSearch />}
          placeholder="Search"
        />
      </Example>
    </Example>
  );
}
