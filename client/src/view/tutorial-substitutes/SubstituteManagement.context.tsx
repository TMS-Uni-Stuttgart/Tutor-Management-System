import { plainToClass } from 'class-transformer';
import _ from 'lodash';
import { DateTime } from 'luxon';
import React, { PropsWithChildren, useCallback, useContext, useEffect, useState } from 'react';
import { NamedElement } from 'shared/model/Common';
import { ITutorial } from 'shared/model/Tutorial';
import { FetchState, useFetchState } from '../../hooks/useFetchState';
import { Tutorial } from '../../model/Tutorial';
import { notInitializied } from '../../util/throwFunctions';

interface Props {
  tutorialId: string;
}

export interface SubstituteManagementContextType {
  tutorial: FetchState<Tutorial>;
  tutors: FetchState<NamedElement[]>;
  selectedDate?: DateTime;
  setSelectedDate: (date: DateTime) => void;
  selectedSubstitutes: Map<string, NamedElement>;
  isSubstituteChanged: (date: DateTime) => boolean;
  getSelectedSubstitute: (date: DateTime) => NamedElement | undefined;
  setSelectedSubstitute: (tutor: NamedElement, date: DateTime) => void;
  removeSelectedSubstitute: (date: DateTime) => void;
  resetSelectedSubstitute: (date: DateTime) => void;
  dirty: boolean;
}

const ERR_NOT_INITIALIZED: FetchState<never> = {
  error: 'Context not initialized',
  isLoading: false,
};

const Context = React.createContext<SubstituteManagementContextType>({
  tutorial: ERR_NOT_INITIALIZED,
  tutors: ERR_NOT_INITIALIZED,
  selectedDate: undefined,
  setSelectedDate: notInitializied('SubstituteManagementContext'),
  selectedSubstitutes: new Map(),
  isSubstituteChanged: notInitializied('SubstituteManagementContext'),
  getSelectedSubstitute: notInitializied('SubstituteManagementContext'),
  setSelectedSubstitute: notInitializied('SubstituteManagementContext'),
  removeSelectedSubstitute: notInitializied('SubstituteManagementContext'),
  resetSelectedSubstitute: notInitializied('SubstituteManagementContext'),
  dirty: false,
});

export function useSubstituteManagementContext(): SubstituteManagementContextType {
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
            substitutes: [['2020-07-22', { id: '2', firstname: 'Hermine', lastname: 'Granger' }]],
            dates: ['2020-07-15', '2020-07-08', '2020-06-24', '2020-07-22', '2020-07-01'],
            students: [],
            teams: [],
            startTime: '',
            endTime: '',
            correctors: [],
          };

          resolve(plainToClass(Tutorial, DUMMY_TUTORIAL_DATA));
        }, 1000);
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
        }, 2000);
      }),
    immediate: true,
    params: [],
  });

  const [selectedDate, setSelectedDate] = useState<DateTime>();
  const [selectedSubstitutes, updateSubstituteMap] = useState(new Map<string, NamedElement>());
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (tutorial.value) {
      updateSubstituteMap(new Map<string, NamedElement>(tutorial.value.substitutes));
    } else {
      updateSubstituteMap(new Map());
    }
  }, [tutorial.value]);

  useEffect(() => {
    if (tutorial.value) {
      setDirty(!_.isEqual(selectedSubstitutes, tutorial.value.substitutes));
    } else {
      setDirty(false);
    }
  }, [tutorial.value, selectedSubstitutes]);

  const getSelectedSubstitute = useCallback(
    (date: DateTime) => {
      return selectedSubstitutes.get(date.toISODate());
    },
    [selectedSubstitutes]
  );
  const setSelectedSubstitute = useCallback(
    (tutor: NamedElement, date: DateTime) => {
      updateSubstituteMap(new Map(selectedSubstitutes.set(date.toISODate(), tutor)));
    },
    [selectedSubstitutes]
  );
  const removeSelectedSubstitute = useCallback(
    (date: DateTime) => {
      selectedSubstitutes.delete(date.toISODate());
      updateSubstituteMap(new Map(selectedSubstitutes));
    },
    [selectedSubstitutes]
  );
  const resetSelectedSubstitute = useCallback(
    (date: DateTime) => {
      if (!tutorial.value) {
        return;
      }

      const substitute = tutorial.value.getSubstitute(date);
      if (!!substitute) {
        setSelectedSubstitute(substitute, date);
      } else {
        removeSelectedSubstitute(date);
      }
    },
    [tutorial.value, setSelectedSubstitute, removeSelectedSubstitute]
  );
  const isSubstituteChanged = useCallback(
    (date: DateTime) => {
      if (!tutorial.value) {
        return false;
      }

      const selectedSubstId = getSelectedSubstitute(date)?.id;
      const currentSubstId = tutorial.value.getSubstitute(date)?.id;

      return selectedSubstId !== currentSubstId;
    },
    [tutorial.value, getSelectedSubstitute]
  );

  return (
    <Context.Provider
      value={{
        tutorial,
        tutors,
        selectedDate,
        setSelectedDate,
        selectedSubstitutes,
        getSelectedSubstitute,
        isSubstituteChanged,
        setSelectedSubstitute,
        removeSelectedSubstitute,
        resetSelectedSubstitute,
        dirty,
      }}
    >
      {children}
    </Context.Provider>
  );
}

export default SubstituteManagementContextProvider;
