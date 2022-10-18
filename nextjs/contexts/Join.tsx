import Modal from 'components/Modal';
import SignUpWithCredentials from 'components/Pages/SignUp/Credentials';
import { Session } from 'next-auth';
import { getSession, useSession } from 'next-auth/react';
import React, { createContext, useContext, useState } from 'react';

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

export type StartSignUpFn = (props: StartSignUpProps) => any;

export const JoinContext = ({ children }: Props) => {
  const { data, status } = useSession();
  const [open, setOpen] = useState(false);
  const [communityId, setCommunityId] = useState<string>();
  const [onSignInAction, setOnSignInAction] = useState<onSignInType>();

  const startSignUp = async (props: StartSignUpProps) => {
    setOnSignInAction(props.onSignIn);
    setCommunityId(props.communityId);
    if (status === 'authenticated') {
      const res = await fetch('/api/invites/join-button', {
        method: 'post',
        body: JSON.stringify({
          communityId: props.communityId,
        }),
      });
      if (res.ok) {
        await callAfterSignInFunction(props.onSignIn, data);
        return;
      }
    }
    setOpen(!open);
  };

  const onSuccessfulSignIn = async () => {
    setOpen(false);
    const session = await getSession();
    await callAfterSignInFunction(onSignInAction, session);
  };

  async function callAfterSignInFunction(
    onSignInAction: onSignInType | undefined,
    session: Session | null
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

  return (
    <Context.Provider value={{ startSignUp }}>
      <Modal
        {...{
          open,
          setOpen: onCloseModal,
          title: 'Join the community',
          subtitle: 'Sign up to join the community and start to chat',
        }}
      >
        <SignUpWithCredentials
          {...{
            state: communityId,
            noFollow: true,
            onSignIn: onSuccessfulSignIn,
          }}
        />
      </Modal>
      {children}
    </Context.Provider>
  );
};

export const useJoinContext = () => useContext(Context);
