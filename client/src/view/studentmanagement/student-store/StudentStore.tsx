import React, { PropsWithChildren, createContext, useContext, useEffect } from 'react';
import { Student } from 'shared/dist/model/Student';
import { useAsyncReducer, AsyncDispatch } from '../../../util/AsyncReducer';
import { StudentStoreAction, StudentStoreActionType } from './StudentStore.actions';
import { Team } from 'shared/dist/model/Team';
import studentStoreReducer from './StudentStore.reducers';
import { ScheincriteriaSummaryByStudents } from 'shared/dist/model/ScheinCriteria';

export interface StudentStore {
  students: Student[];
  teams?: Team[];
  tutorialId?: string;
  isInitialized: boolean;
  summaries: ScheincriteriaSummaryByStudents;
}

interface StudentContext {
  store: StudentStore;
  dispatch: (action: StudentStoreAction) => Promise<void>;
}

const initialState: StudentStore = {
  students: [],
  teams: undefined,
  tutorialId: 'NOT_INITIALIZED',
  isInitialized: false,
  summaries: {},
};

const StudentStoreContext = createContext<StudentContext>({
  store: initialState,
  dispatch: () =>
    new Promise((_, reject) =>
      reject("Student context's dispatch used outside a StudentoverviewStoreProvider.")
    ),
});

interface Props {
  tutorialId?: string;
}

export type StudentStoreDispatcher = AsyncDispatch<StudentStoreAction>;

export function useStudentStore(): [StudentStore, StudentStoreDispatcher] {
  const { store, dispatch } = useContext(StudentStoreContext);

  return [store, dispatch];
}

function StudentoverviewStoreProvider({
  tutorialId,
  children,
}: PropsWithChildren<Props>): JSX.Element {
  const [store, dispatch] = useAsyncReducer(studentStoreReducer, initialState);

  useEffect(() => {
    if (tutorialId === store.tutorialId) {
      return;
    }

    dispatch({
      type: StudentStoreActionType.REINITIALIZE_START,
      data: {
        tutorialId,
        dispatch,
      },
    });
  }, [tutorialId, dispatch, store.tutorialId]);

  return (
    <StudentStoreContext.Provider value={{ store, dispatch }}>
      {children}
    </StudentStoreContext.Provider>
  );
}

export default StudentoverviewStoreProvider;
