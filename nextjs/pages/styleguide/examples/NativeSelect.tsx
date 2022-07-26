import Example from '../Example';
import NativeSelect from '../../../components/NativeSelect';
import { AiOutlineNumber } from 'react-icons/ai';

export default function MessageExample() {
  return (
    <Example header="NativeSelect">
      <Example description="NativeSelect can have a label.">
        <NativeSelect
          label="Name"
          id="select-input-foo"
          options={[
            { label: 'Option 1', value: 'option-1' },
            { label: 'Option 2', value: 'option-2' },
          ]}
        />
      </Example>
      <Example description="NativeSelect can have an icon.">
        <NativeSelect
          id="select-input-bar"
          icon={<AiOutlineNumber />}
          options={[
            { label: 'Option 1', value: 'option-1' },
            { label: 'Option 2', value: 'option-2' },
          ]}
        />
      </Example>
    </Example>
  );
}
