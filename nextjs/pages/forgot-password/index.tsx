import Layout from '../../components/layout/CardLayout';
import EmailField from '../../components/EmailField';
import Button from '../../components/Button';
import { toast } from 'components/Toast';

export default function ForgotPassword() {
  const onSubmit = async (event: any) => {
    event.preventDefault();
    const form = event.target;
    const email = form.email.value;
    try {
      const response = await fetch('/api/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
      if (response.ok) {
        toast.success('Please check your email for a reset link');
      } else throw response;
    } catch (exception) {
      toast.error('Something went wrong. Please try again.');
    }
  };
  return (
    <Layout header="Forgot Password">
      <form onSubmit={onSubmit}>
        <EmailField label="Email" id="email" required />
        <Button type="submit" block>
          Submit
        </Button>
      </form>
    </Layout>
  );
}
