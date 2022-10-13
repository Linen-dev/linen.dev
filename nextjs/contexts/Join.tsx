import Modal from 'components/Modal';
import SignUpComponent from 'components/Pages/SignUp';
import { getSession } from 'next-auth/react';
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
  const [open, setOpen] = useState(false);
  const [communityId, setCommunityId] = useState<string>();
  const [onSignInAction, setOnSignInAction] = useState<onSignInType>();

  const startSignUp = (props: StartSignUpProps) => {
    props.onSignIn && setOnSignInAction(props.onSignIn);
    setCommunityId(props.communityId);
    setOpen(!open);
  };

  const onSuccessfulSignIn = async () => {
    setOpen(false);
    const session = await getSession();
    await onSignInAction?.run({
      currentUser: session?.user,
      startSignUp: () => {},
      ...onSignInAction.init,
    })({
      ...onSignInAction.params,
    });
    window.location.href = window.location.href;
  };

  const onCloseModal = (e: boolean) => {
    console.log('onCloseModal');
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
        <SignUpComponent
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
