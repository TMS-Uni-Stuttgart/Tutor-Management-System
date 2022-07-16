import _ from 'lodash';
import { DateTime } from 'luxon';
import React, { PropsWithChildren, useCallback, useContext, useEffect, useState } from 'react';
import { NamedElement } from 'shared/model/Common';
import { getTutorial } from '../../hooks/fetching/Tutorial';
import { getUserNames } from '../../hooks/fetching/User';
import { BaseArrayType, FetchFunction, useFetchState } from '../../hooks/useFetchState';
import { Tutorial } from '../../model/Tutorial';
import { throwContextNotInitialized } from '../../util/throwFunctions';

interface Props {
  tutorialId: string;
}

interface ResponseState<T, P extends BaseArrayType> {
  value?: T;
  isLoading: boolean;
  error?: string;
  execute: FetchFunction<P>;
}

export interface SubstituteManagementContextType {
  tutorial: ResponseState<Tutorial, [string]>;
  tutors: ResponseState<NamedElement[], []>;
  selectedDate?: DateTime;
  setSelectedDate: (date: DateTime) => void;
  isSubstituteChanged: (date: DateTime) => boolean;
  getSelectedSubstitute: (date: DateTime) => NamedElement | undefined;
  setSelectedSubstitute: (tutor: NamedElement, date: DateTime) => void;
  removeSelectedSubstitute: (date: DateTime) => void;
  resetSelectedSubstitute: (date: DateTime) => void;
  dirty: boolean;
  resetDirty: () => void;
}

const ERR_NOT_INITIALIZED: ResponseState<never, []> = {
  error: 'Context not initialized',
  isLoading: false,
  execute: throwContextNotInitialized('SubstituteManagementContext'),
};

const Context = React.createContext<SubstituteManagementContextType>({
  tutorial: ERR_NOT_INITIALIZED,
  tutors: ERR_NOT_INITIALIZED,
  selectedDate: undefined,
  setSelectedDate: throwContextNotInitialized('SubstituteManagementContext'),
  isSubstituteChanged: throwContextNotInitialized('SubstituteManagementContext'),
  getSelectedSubstitute: throwContextNotInitialized('SubstituteManagementContext'),
  setSelectedSubstitute: throwContextNotInitialized('SubstituteManagementContext'),
  removeSelectedSubstitute: throwContextNotInitialized('SubstituteManagementContext'),
  resetSelectedSubstitute: throwContextNotInitialized('SubstituteManagementContext'),
  resetDirty: throwContextNotInitialized('SubstituteManagementContext'),
  dirty: false,
});

export function useSubstituteManagementContext(): SubstituteManagementContextType {
  const value = useContext(Context);
  return { ...value };
}

function useTutorial(tutorialId: string): ResponseState<Tutorial, [string]> {
  const [value, isLoading, error, execute] = useFetchState({
    fetchFunction: getTutorial,
    immediate: true,
    params: [tutorialId],
  });
  return { value, isLoading, error, execute };
}

function useTutors(): ResponseState<NamedElement[], []> {
  const [value, isLoading, error, execute] = useFetchState({
    fetchFunction: getUserNames,
    immediate: true,
    params: [],
  });
  return { value, isLoading, error, execute };
}

function SubstituteManagementContextProvider({
  children,
  tutorialId,
}: PropsWithChildren<Props>): JSX.Element {
  const tutorial = useTutorial(tutorialId);
  const tutors = useTutors();

  const [selectedDate, setSelectedDate] = useState<DateTime>();
  const [selectedSubstitutes, updateSubstituteMap] = useState(new Map<string, NamedElement>());
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (tutorial.value && tutors.value) {
      const substMap = new Map<string, NamedElement>();

      for (const [date, substId] of tutorial.value.substitutes) {
        const tutor = tutors.value.find((t) => t.id === substId);
        if (tutor) {
          substMap.set(date, tutor);
        }
      }

      updateSubstituteMap(new Map<string, NamedElement>(substMap));
    } else {
      updateSubstituteMap(new Map());
    }
  }, [tutorial.value, tutors.value]);

  useEffect(() => {
    if (tutorial.value) {
      const parsedMap = new Map<string, string>();
      selectedSubstitutes.forEach((el, date) => parsedMap.set(date, el.id));

      setDirty(!_.isEqual(parsedMap, tutorial.value.substitutes));
    } else {
      setDirty(false);
    }
  }, [tutorial.value, selectedSubstitutes]);

  const getSelectedSubstitute = useCallback(
    (date: DateTime) => {
      return selectedSubstitutes.get(date.toISODate() ?? 'DATE_NOTE_PARSEABLE');
    },
    [selectedSubstitutes]
  );
  const setSelectedSubstitute = useCallback(
    (tutor: NamedElement, date: DateTime) => {
      const dateKey = date.toISODate();
      if (dateKey) {
        updateSubstituteMap(new Map(selectedSubstitutes.set(dateKey, tutor)));
      }
    },
    [selectedSubstitutes]
  );
  const removeSelectedSubstitute = useCallback(
    (date: DateTime) => {
      selectedSubstitutes.delete(date.toISODate() ?? 'DATE_NOTE_PARSEABLE');
      updateSubstituteMap(new Map(selectedSubstitutes));
    },
    [selectedSubstitutes]
  );
  const resetSelectedSubstitute = useCallback(
    (date: DateTime) => {
      if (!tutorial.value || !tutors.value) {
        return;
      }

      const substituteId = tutorial.value.getSubstitute(date);
      const substitute = tutors.value.find((t) => t.id === substituteId);
      if (!!substitute) {
        setSelectedSubstitute(substitute, date);
      } else {
        removeSelectedSubstitute(date);
      }
    },
    [tutorial.value, tutors.value, setSelectedSubstitute, removeSelectedSubstitute]
  );
  const isSubstituteChanged = useCallback(
    (date: DateTime) => {
      if (!tutorial.value) {
        return false;
      }

      const selectedSubstId = getSelectedSubstitute(date)?.id;
      const currentSubstId = tutorial.value.getSubstitute(date);

      return selectedSubstId !== currentSubstId;
    },
    [tutorial.value, getSelectedSubstitute]
  );
  const resetDirty = useCallback(() => setDirty(false), []);

  return (
    <Context.Provider
      value={{
        tutorial,
        tutors,
        selectedDate,
        setSelectedDate,
        getSelectedSubstitute,
        isSubstituteChanged,
        setSelectedSubstitute,
        removeSelectedSubstitute,
        resetSelectedSubstitute,
        dirty,
        resetDirty,
      }}
    >
      {children}
    </Context.Provider>
  );
}

export default SubstituteManagementContextProvider;
