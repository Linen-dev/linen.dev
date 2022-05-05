import Layout from '@/components/layout/CardLayout';
import TextField from '@/components/TextField';
import toast from '@/components/Toast';
import { SerializedAccount } from '@/serializers/account';
import Button from '@/components/Button';
import Router from 'next/router';

interface Props {
  account: SerializedAccount;
}

export default function CustomizePage({ account }: Props) {
  const onSubmit = async (event: any) => {
    event.preventDefault();
    const form = event.target;
    const homeUrl = form.homeUrl.value;
    const docsUrl = form.docsUrl.value;

    const updateAccountResponse = await fetch('/api/accounts', {
      method: 'PUT',
      body: JSON.stringify({
        accountId: account.id,
        homeUrl,
        docsUrl,
      }),
    });
    if (!updateAccountResponse.ok) {
      return toast.error('Something went wrong!');
    }
    return Router.push('/onboarding/premium');
  };

  return (
    <Layout header="Customize your account">
      <form onSubmit={onSubmit}>
        <TextField
          label="Home url"
          placeholder="https://yourwebsite.com"
          id="homeUrl"
          required
        />
        <TextField
          label="Docs url"
          placeholder="https://docs.yourwebsite.com"
          id="docsUrl"
          required
        />
        <Button type="submit" block>
          Next
        </Button>
      </form>
    </Layout>
  );
}
