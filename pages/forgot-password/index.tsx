import Layout from '../../components/layout/CardLayout';
import TextField from '../../components/TextField';
import Button from '../../components/Button';

interface Props {}

export default function ForgotPassword({}: Props) {
  return (
    <Layout header="Forgot Password">
      <form>
        <TextField label="Email" id="email" />
        <Button type="submit" block>
          Submit
        </Button>
      </form>
    </Layout>
  );
}
