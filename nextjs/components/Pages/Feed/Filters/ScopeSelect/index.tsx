import NativeSelect from 'components/NativeSelect';
import { Scope } from 'types/shared';

interface Props {
  onChange(type: string, value: string): void;
  defaultValue: string;
}

export default function ScopeSelect({ onChange, defaultValue }: Props) {
  return (
    <NativeSelect
      id="scope"
      defaultValue={defaultValue}
      options={[
        { label: 'All', value: Scope.All },
        { label: 'I participate in', value: Scope.Participant },
      ]}
      onChange={(event) => onChange('scope', event.target.value)}
    />
  );
}
