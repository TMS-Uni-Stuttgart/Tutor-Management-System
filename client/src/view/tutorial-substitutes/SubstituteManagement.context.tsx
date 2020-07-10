import { plainToClass } from 'class-transformer';
import { DateTime } from 'luxon';
import React, { PropsWithChildren, useContext, useState } from 'react';
import { NamedElement } from 'shared/model/Common';
import { ITutorial } from 'shared/model/Tutorial';
import { FetchState, useFetchState } from '../../hooks/useFetchState';
import { Tutorial } from '../../model/Tutorial';

interface Props {
  tutorialId: string;
}

interface ContextType {
  tutorial: FetchState<Tutorial>;
  tutors: FetchState<NamedElement[]>;
  selectedDate?: DateTime;
  setSelectedDate: (date: DateTime) => void;
}

const ERR_NOT_INITIALIZED: FetchState<never> = {
  error: 'Context not initialized',
  isLoading: false,
};

const Context = React.createContext<ContextType>({
  tutorial: ERR_NOT_INITIALIZED,
  tutors: ERR_NOT_INITIALIZED,
  selectedDate: undefined,
  setSelectedDate: () => {
    throw new Error('Not initialized');
  },
});

export function useSubstituteManagementContext(): ContextType {
  const value = useContext(Context);
  return { ...value };
}

function SubstituteManagementContextProvider({
  children,
  tutorialId,
}: PropsWithChildren<Props>): JSX.Element {
  // FIXME: Use real fetching functions.
  const tutorial = useFetchState({
    fetchFunction: (id: string) =>
      new Promise<Tutorial>((resolve) => {
        console.log(`Fetching tutorial with ID: '${id}'...`);
        setTimeout(() => {
          const DUMMY_TUTORIAL_DATA: ITutorial = {
            id: 'dev-tutorial-id',
            slot: 'Mi07',
            tutor: { firstname: 'Dev', lastname: 'Tutor', id: 'tutor-id' },
            substitutes: [
              ['2020-07-22', { id: 'subst-id', firstname: 'Hermine', lastname: 'Granger' }],
            ],
            dates: ['2020-07-15', '2020-07-08', '2020-06-24', '2020-07-22', '2020-07-01'],
            students: [],
            teams: [],
            startTime: '',
            endTime: '',
            correctors: [],
          };

          resolve(plainToClass(Tutorial, DUMMY_TUTORIAL_DATA));
        }, 3500);
      }),
    immediate: true,
    params: [tutorialId],
  });
  const tutors = useFetchState({
    fetchFunction: () =>
      new Promise<NamedElement[]>((resolve) => {
        console.log('Fetching all tutors...');
        setTimeout(() => {
          const DUMMY_STUDENTS: NamedElement[] = [
            { id: '1', firstname: 'Harry', lastname: 'Potter' },
            { id: '2', firstname: 'Hermine', lastname: 'Granger' },
            { id: '3', firstname: 'Ron', lastname: 'Weasley' },
            { id: '4', firstname: 'Ginny', lastname: 'Weasley' },
          ];
          resolve(DUMMY_STUDENTS);
        }, 2500);
      }),
    immediate: true,
    params: [],
  });
  const [selectedDate, setSelectedDate] = useState<DateTime>();

  return (
    <Context.Provider
      value={{
        tutorial,
        tutors,
        selectedDate,
        setSelectedDate,
      }}
    >
      {children}
    </Context.Provider>
  );
}

export default SubstituteManagementContextProvider;
