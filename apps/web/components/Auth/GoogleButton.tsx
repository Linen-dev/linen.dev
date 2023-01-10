import { Button } from '@linen/ui';
import { FcGoogle } from 'react-icons/fc';
import { qs } from 'utilities/url';

export default function GoogleButton({
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
        window.location.href = `/api/auth/google?${qs({
          callbackUrl,
          state,
          origin: window.location.origin,
        })}`;
      }}
      color="gray"
    >
      <div className="flex gap-2 align-middle items-center justify-center">
        <FcGoogle />
        <span>Sign {flow === 'sign-in' ? 'in' : 'up'} with Google</span>
      </div>
    </Button>
  );
}
