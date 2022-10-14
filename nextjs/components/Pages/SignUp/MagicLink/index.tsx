import React, { useState } from 'react';
import EmailField from 'components/EmailField';
import Button from 'components/Button';
import Link from 'components/Link';
import { qs } from 'utilities/url';

interface Props {
  callbackUrl: string;
  csrfToken: string;
  email: string;
}

export default function MagicLink({
  callbackUrl,
  csrfToken,
  email: initialEmail,
}: Props) {
  const [email, setEmail] = useState(initialEmail || '');
  const [loading, setLoading] = useState(false);
  return (
    <form
      className="px-20"
      method="post"
      action={'/api/auth/signin/email?' + qs({ callbackUrl })}
      onSubmit={() => setLoading(true)}
    >
      <input name="csrfToken" type="hidden" defaultValue={csrfToken} />
      <EmailField
        className="text-center"
        placeholder="Email address"
        id="email"
        required
        value={email}
        onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
          setEmail(event.target.value)
        }
      />
      <Button type="submit" block disabled={loading}>
        Continue
      </Button>
      <p className="text-xs text-center text-gray-700">
        By using the platform, you agree to our{' '}
        <a
          target="_blank"
          className="text-blue-600 hover:text-blue-800 visited:text-purple-600"
          href="/legal/terms"
        >
          Terms
        </a>{' '}
        and{' '}
        <a
          className="text-blue-600 hover:text-blue-800 visited:text-purple-600"
          target="_blank"
          href="/legal/privacy"
        >
          Privacy Policy
        </a>
        .
      </p>
      <hr className="my-10" />
      <p className="text-xs text-center text-gray-700 mb-3">
        Prefer passwords?
        <br />
        <Link href={`/signup?mode=creds&email=${email || ''}`}>
          Sign up with credentials
        </Link>
        .
      </p>
      <p className="text-xs text-center text-gray-600">
        Already have an account?
        <br />
        <Link href={`/signin`}>Sign in</Link>.
      </p>
    </form>
  );
}
