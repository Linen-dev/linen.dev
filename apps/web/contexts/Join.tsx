import { Modal } from '@linen/ui';
import type { SessionType } from 'services/session';
import { getSession } from 'utilities/auth/react';
import React, { createContext, useContext, useEffect, useState } from 'react';
import SignUp from 'pages/signup';
import SignIn from 'pages/signin';
import { SignInMode } from 'components/Auth';

const Context = createContext<{
  startSignUp?: StartSignUpFn;
}>({});

type Props = {
  children: React.ReactNode;
};

type StartSignUpProps = {
  communityId: string;
  onSignIn?: onSignInType;
};
type onSignInType = {
  run: Function;
  init: any;
  params: any;
};
type AuthFlow = 'signup' | 'signin';

export type StartSignUpFn = (props: StartSignUpProps) => any;

export const JoinContext = ({ children }: Props) => {
  const [open, setOpen] = useState(false);
  const [communityId, setCommunityId] = useState<string>();
  const [onSignInAction, setOnSignInAction] = useState<onSignInType>();
  const [flow, setFlow] = useState<AuthFlow>('signup');
  const [mode, setMode] = useState<SignInMode>('magic');

  const [callbackUrl, setCallbackUrl] = useState<string>();

  useEffect(() => {
    if (!callbackUrl) {
      setCallbackUrl(window.location.href);
    }
  }, [callbackUrl]);

  async function join({ communityId }: { communityId: string }) {
    return await fetch('/api/invites/join-button', {
      method: 'post',
      body: JSON.stringify({
        communityId,
      }),
    });
  }

  const startSignUp = async (props: StartSignUpProps) => {
    setOnSignInAction(props.onSignIn);
    setCommunityId(props.communityId);
    const session = await getSession();
    if (session) {
      const res = await join(props);
      if (res.ok) {
        await callAfterSignInFunction(props.onSignIn, session);
        return;
      }
    }
    setOpen(!open);
  };

  const onSuccessfulSignIn = async () => {
    const session = await getSession();
    if (session && communityId) {
      const res = await join({ communityId });
      if (res.ok) {
        await callAfterSignInFunction(onSignInAction, session);
        return;
      }
    }
    setOpen(false);
  };

  async function callAfterSignInFunction(
    onSignInAction: onSignInType | undefined,
    session: SessionType | null
  ) {
    await onSignInAction?.run({
      currentUser: session?.user,
      startSignUp: () => {},
      ...onSignInAction?.init,
    })?.({
      ...onSignInAction?.params,
    });
    window.location.href = window.location.href;
  }

  const onCloseModal = (e: boolean) => {
    setOpen(e);
  };

  const mapText = {
    signup: 'up',
    signin: 'in',
  };

  return (
    <Context.Provider value={{ startSignUp }}>
      <Modal
        {...{
          open,
          close: onCloseModal,
        }}
      >
        <div className="m-5 text-center">
          <h3 className="text-lg font-medium leading-6 text-gray-900">
            Join the community
          </h3>
          <div className="mt-2">
            <p className="text-sm text-gray-500">
              Sign {mapText[flow]} to join the community and start to chat
            </p>
          </div>
        </div>
        {flow === 'signup' && (
          <SignUp
            mode={mode}
            withLayout={false}
            callbackUrl={callbackUrl}
            showSignIn={(mode) => {
              setFlow('signin');
              setMode(mode);
            }}
            onSignIn={onSuccessfulSignIn}
            state={communityId}
            // email, error,
          />
        )}
        {flow === 'signin' && (
          <SignIn
            mode={mode}
            withLayout={false}
            callbackUrl={callbackUrl}
            showSignUp={(mode) => {
              setFlow('signup');
              setMode(mode);
            }}
            onSignIn={onSuccessfulSignIn}
            state={communityId}
            // email, error
          />
        )}
      </Modal>
      {children}
    </Context.Provider>
  );
};

export const useJoinContext = () => useContext(Context);
