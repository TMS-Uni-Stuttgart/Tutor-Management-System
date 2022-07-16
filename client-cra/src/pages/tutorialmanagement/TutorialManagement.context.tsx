import React, { ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Role } from 'shared/model/Role';
import { IUser } from 'shared/model/User';
import { getAllTutorials } from '../../hooks/fetching/Tutorial';
import { getUsersWithRole } from '../../hooks/fetching/User';
import { useCustomSnackbar } from '../../hooks/snackbar/useCustomSnackbar';
import { useFetchState } from '../../hooks/useFetchState';
import { Tutorial } from '../../model/Tutorial';
import { throwContextNotInitialized } from '../../util/throwFunctions';
import { SORTERS, SupportedSorters, TutorialSorter } from './sorters/Sorters';

interface Props {
  children?: ReactNode;
}

interface FetchErrors {
  tutorials?: string;
  tutors?: string;
  correctors?: string;
}

export interface TutorialManagementContextType {
  tutorials: Tutorial[];
  tutors: IUser[];
  correctors: IUser[];
  isLoading: boolean;
  setSortingMethod: (method: SupportedSorters) => void;
  fetchTutorials: () => Promise<void>;
  error?: FetchErrors;
}

const Context = React.createContext<TutorialManagementContextType>({
  tutorials: [],
  tutors: [],
  correctors: [],
  isLoading: false,
  setSortingMethod: throwContextNotInitialized('TutorialManagementContext'),
  fetchTutorials: throwContextNotInitialized('TutorialManagementContext'),
  error: undefined,
});

export function useTutorialManagementContext(): TutorialManagementContextType {
  const value = useContext(Context);
  return { ...value };
}

function TutorialManagementContextProvider({ children }: Props): JSX.Element {
  const { enqueueSnackbarWithList } = useCustomSnackbar();
  const [sorter, setSorter] = useState<TutorialSorter>(SORTERS.date);

  const [tutorials = [], isLoadingTutorials, errorTutorials, fetchTutorials] = useFetchState({
    fetchFunction: getAllTutorials,
    immediate: true,
    params: [],
  });
  const [tutors = [], isLoadingTutors, errorTutors] = useFetchState({
    fetchFunction: getUsersWithRole,
    immediate: true,
    params: [Role.TUTOR],
  });
  const [correctors = [], isLoadingCorrectors, errorCorrectors] = useFetchState({
    fetchFunction: getUsersWithRole,
    immediate: true,
    params: [Role.CORRECTOR],
  });

  const sortedTutorials = useMemo<Tutorial[]>(() => sorter.sort(tutorials), [tutorials, sorter]);
  const isLoading = isLoadingTutorials || isLoadingTutors || isLoadingCorrectors;
  const error = useMemo<FetchErrors | undefined>(() => {
    if (!errorTutorials && !errorTutors && !errorCorrectors) {
      return undefined;
    }

    return { tutors: errorTutors, tutorials: errorTutorials, correctors: errorCorrectors };
  }, [errorTutors, errorTutorials, errorCorrectors]);

  const setSortingMethod = useCallback((method: SupportedSorters) => {
    const newSorter: TutorialSorter | undefined = SORTERS[method];
    if (newSorter) {
      setSorter(newSorter);
    } else {
      throw new Error(`Unsupported sorter method "${method}"`);
    }
  }, []);

  useEffect(() => {
    const items: string[] = [];

    if (error?.tutorials) {
      items.push(error.tutorials);
    }

    if (error?.tutors) {
      items.push(error.tutors);
    }

    if (error?.correctors) {
      items.push(error.correctors);
    }

    if (items.length > 0) {
      enqueueSnackbarWithList({
        title: 'Fehler beim Datenabruf',
        textBeforeList: 'Beim Abrufen der Daten sind folgende Fehler aufgetreten:',
        items: items,
        variant: 'error',
      });
    }
  }, [enqueueSnackbarWithList, error]);

  return (
    <Context.Provider
      value={{
        tutorials: sortedTutorials,
        tutors,
        correctors,
        isLoading,
        error,
        setSortingMethod,
        fetchTutorials,
      }}
    >
      {children}
    </Context.Provider>
  );
}

export default TutorialManagementContextProvider;
