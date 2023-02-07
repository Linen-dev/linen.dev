import { Button } from '@linen/ui';
import { GoMarkGithub } from 'react-icons/go';
import { qs } from '@linen/utilities/url';

export default function GitHubButton({
  flow,
  callbackUrl,
  state,
}: {
  flow: 'sign-in' | 'sign-up';
  callbackUrl?: string;
  state?: string;
}) {
  return (
    <Button
      block={true}
      onClick={(e: any) => {
        e.preventDefault();
        window.location.href = `/api/auth/github?${qs({
          callbackUrl,
          state,
          origin: window.location.origin,
        })}`;
      }}
      color="black"
    >
      <div className="flex gap-2 align-middle items-center justify-center">
        <GoMarkGithub />
        <span>Sign {flow === 'sign-in' ? 'in' : 'up'} with GitHub</span>
      </div>
    </Button>
  );
}
