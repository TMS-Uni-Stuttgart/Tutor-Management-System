import _ from 'lodash';
import { DateTime } from 'luxon';
import React, { PropsWithChildren, useCallback, useContext, useEffect, useState } from 'react';
import { NamedElement } from 'shared/model/Common';
import { getTutorial } from '../../hooks/fetching/Tutorial';
import { getUserNames } from '../../hooks/fetching/User';
import { UseFetchState, useFetchState } from '../../hooks/useFetchState';
import { Tutorial } from '../../model/Tutorial';
import { notInitializied } from '../../util/throwFunctions';

interface Props {
  tutorialId: string;
}

export interface SubstituteManagementContextType {
  tutorial: UseFetchState<Tutorial, [string]>;
  tutors: UseFetchState<NamedElement[], []>;
  selectedDate?: DateTime;
  setSelectedDate: (date: DateTime) => void;
  isSubstituteChanged: (date: DateTime) => boolean;
  getSelectedSubstitute: (date: DateTime) => NamedElement | undefined;
  setSelectedSubstitute: (tutor: NamedElement, date: DateTime) => void;
  removeSelectedSubstitute: (date: DateTime) => void;
  resetSelectedSubstitute: (date: DateTime) => void;
  dirty: boolean;
}

const ERR_NOT_INITIALIZED: UseFetchState<never, []> = {
  error: 'Context not initialized',
  isLoading: false,
  execute: notInitializied('SubstituteManagementContext'),
};

const Context = React.createContext<SubstituteManagementContextType>({
  tutorial: ERR_NOT_INITIALIZED,
  tutors: ERR_NOT_INITIALIZED,
  selectedDate: undefined,
  setSelectedDate: notInitializied('SubstituteManagementContext'),
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
  const tutorial = useFetchState({
    fetchFunction: getTutorial,
    immediate: true,
    params: [tutorialId],
  });
  const tutors = useFetchState({
    fetchFunction: getUserNames,
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
