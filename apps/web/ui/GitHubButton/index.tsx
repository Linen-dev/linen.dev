import React from 'react';
import Button from '@/Button';
import { GoMarkGithub } from '@react-icons/all-files/go/GoMarkGithub';
import { qs } from '@linen/utilities/url';
import styles from './index.module.scss';

export default function GitHubButton({
  flow,
  callbackUrl,
  state,
  sso,
  redirectFn,
  origin,
}: {
  flow: 'sign-in' | 'sign-up';
  callbackUrl?: string;
  state?: string;
  sso?: string;
  redirectFn?(url: string): void;
  origin?: string;
}) {
  return (
    <Button
      block={true}
      onClick={(e: any) => {
        e.preventDefault();
        const url = `/api/auth/github?${qs({
          callbackUrl,
          state,
          origin: origin || window.location.origin,
          sso,
        })}`;
        if (redirectFn) {
          redirectFn(url);
        } else {
          window.location.href = url;
        }
      }}
      color="black"
    >
      <div className={styles.btn}>
        <GoMarkGithub />
        <span>Sign {flow === 'sign-in' ? 'in' : 'up'} with GitHub</span>
      </div>
    </Button>
  );
}
