import React, { PropsWithChildren, useContext } from 'react';
import { NamedElement } from 'shared/model/Common';
import { FetchState, useFetchState } from '../../hooks/useFetchState';
import { Tutorial } from '../../model/Tutorial';

interface Props {
  tutorialId: string;
}

interface ContextType {
  tutorial: FetchState<Tutorial>;
  tutors: FetchState<NamedElement[]>;
}

const ERR_NOT_INITIALIZED: FetchState<never> = {
  error: 'Context not initialized',
  isLoading: false,
};

const Context = React.createContext<ContextType>({
  tutorial: ERR_NOT_INITIALIZED,
  tutors: ERR_NOT_INITIALIZED,
});

export function useSubstituteManagementContext(): ContextType {
  const value = useContext(Context);
  return { ...value };
}

function SubstituteManagementContextProvider({
  children,
  tutorialId,
}: PropsWithChildren<Props>): JSX.Element {
  const { execute, value } = useFetchState({
    fetchFunction: (test: string) =>
      new Promise<number>((resolve) => {
        console.log(`Calling with '${test}'`);
        setTimeout(() => resolve(5), 5000);
      }),
    immediate: true,
    params: ['derpy'],
  });

  return (
    <Context.Provider value={{ tutorial: ERR_NOT_INITIALIZED, tutors: ERR_NOT_INITIALIZED }}>
      {children}
    </Context.Provider>
  );
}

export default SubstituteManagementContextProvider;
