import Button from '@linen/ui/Button';
import { GoMarkGithub } from '@react-icons/all-files/go/GoMarkGithub';
import { qs } from '@linen/utilities/url';

export default function GitHubButton({
  flow,
  callbackUrl,
  state,
  sso,
}: {
  flow: 'sign-in' | 'sign-up';
  callbackUrl?: string;
  state?: string;
  sso?: string;
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
          sso,
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
