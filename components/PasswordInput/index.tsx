import TextInput from '../TextInput';

interface Props {
  id: string;
  placeholder?: string;
}

function PasswordInput({ id, placeholder }: Props) {
  return <TextInput type="password" id={id} placeholder={placeholder} />;
}

export default PasswordInput;
