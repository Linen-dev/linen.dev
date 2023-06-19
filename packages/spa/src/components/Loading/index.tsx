import React, { createContext, useContext, useEffect, useState } from 'react';
import NProgress from 'nprogress';

const Context = createContext<
  [setLoading: React.Dispatch<React.SetStateAction<boolean>>]
>([() => {}]);

interface Props {
  children: React.ReactNode;
}

export const LoadingContext = ({ children }: Props) => {
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (loading) {
      NProgress.start();
    } else {
      NProgress.done();
    }
  }, [loading]);

  return <Context.Provider value={[setLoading]}>{children}</Context.Provider>;
};

export const useLoading = () => useContext(Context);
