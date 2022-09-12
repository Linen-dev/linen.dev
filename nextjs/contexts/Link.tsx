import React, { createContext, useContext } from 'react';

const Context = createContext({
  isSubDomainRouting: false,
  communityName: '',
  communityType: '',
});

interface ContextType {
  isSubDomainRouting: boolean;
  communityName: string;
  communityType: string;
}

interface Props {
  children: React.ReactNode;
  context: ContextType;
}

export function LinkContext({ context, children }: Props) {
  return <Context.Provider value={context}>{children}</Context.Provider>;
}

export function useLinkContext(): ContextType {
  return useContext(Context);
}
