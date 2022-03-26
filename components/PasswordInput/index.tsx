import TextInput from '../TextInput';

interface Props {
  id: string;
  name?: string;
  placeholder?: string;
  required?: boolean;
}

function PasswordInput({ id, name, placeholder, required }: Props) {
  return (
    <TextInput
      type="password"
      id={id}
      name={name}
      placeholder={placeholder}
      required={required}
    />
  );
}

export default PasswordInput;
