import Layout from '../../components/layout/CardLayout';
import EmailField from '../../components/EmailField';
import Button from '../../components/Button';

interface Props {}

export default function ForgotPassword({}: Props) {
  return (
    <Layout header="Forgot Password">
      <form>
        <EmailField label="Email" id="email" />
        <Button type="submit" block>
          Submit
        </Button>
      </form>
    </Layout>
  );
}
