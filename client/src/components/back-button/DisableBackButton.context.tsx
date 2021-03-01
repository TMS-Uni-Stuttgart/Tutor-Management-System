import React, { PropsWithChildren, useContext } from 'react';

interface ContextType {
  isBackDisabled: boolean;
}

const Context = React.createContext<ContextType>({ isBackDisabled: false });

interface Props {
  isBackDisabled: boolean;
}

export function useDisableBackButton(): ContextType {
  const value = useContext(Context);
  return value;
}

function DisableBackButton({ isBackDisabled, children }: PropsWithChildren<Props>): JSX.Element {
  return <Context.Provider value={{ isBackDisabled }}>{children}</Context.Provider>;
}

export default DisableBackButton;
