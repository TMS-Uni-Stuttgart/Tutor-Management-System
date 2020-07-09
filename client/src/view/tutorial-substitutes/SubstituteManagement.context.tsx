import React, { useState, useCallback, useEffect } from 'react';
import { Tutorial } from '../../model/Tutorial';
import { NamedElement } from '../../../../server/src/shared/model/Common';

interface Props {
  
}

interface FetchState<T> {
  value?: T;
  isLoading: boolean;
  error?: string;
}

interface ContextType {
  tutorial: FetchState<Tutorial>;
  tutors: FetchState<NamedElement[]>;
}

const ERR_NOT_INITIALIZED: FetchState<never> = {error: 'Context not initialized', isLoading: false};

const SubstituteManagementContext = React.createContext<ContextType>({
  tutorial: ERR_NOT_INITIALIZED,
  tutors: ERR_NOT_INITIALIZED,
});

interface UseFetchStateParams<T, P extends Array<any>> {
  fetchFunction: () => Promise<T>;
  immediate?: boolean;
  params?: P;
}

function useFetchState<T, P extends Array<any>>({fetchFunction, immediate, params}: UseFetchStateParams<T, P>): FetchState<T> & {execute: ()=>Promise<void>} {
  const [value, setValue] = useState<T>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>();

  const execute = useCallback(()=> {
    setIsLoading(true);
    setError(undefined);

    return fetchFunction().then(response=> setValue(response)).catch(error => setError(error)).finally(()=>setIsLoading(false));
  }, [fetchFunction]);

  useEffect(()=> {
    if (immediate) {
      execute();
    }
  }, [execute, immediate]);

  return {execute, value, isLoading, error};
}

function SubstituteManagementContextProvider({}: Props): JSX.Element {
  const {} = useFetchState<Tutorial>();
  const {} = useFetchState<NamedElement[]>();

  return (
    
  );
}

export default SubstituteManagementContextProvider;
