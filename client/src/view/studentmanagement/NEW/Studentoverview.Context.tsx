import React, { PropsWithChildren, useState, useContext, useEffect } from 'react';
import { Student, StudentDTO } from 'shared/dist/model/Student';
import { createStudent, editStudent, deleteStudent } from '../../../hooks/fetching/Student';
import { sortByName } from 'shared/dist/util/helpers';
import { CREATE_NEW_TEAM_VALUE } from '../../../components/forms/StudentForm';
import { createTeam, getTeamsOfTutorial } from '../../../hooks/fetching/Team';
import { Team } from 'shared/dist/model/Team';

type AsyncReducer<S, A> = (state: S, action: A) => Promise<S>;

type AsyncDispatch<A> = (action: A) => Promise<void>;

function useAsyncReducer<S, A>(
  reducer: AsyncReducer<S, A>,
  initialState: S
): [S, (action: A) => Promise<void>] {
  const [state, setState] = useState<S>(initialState);

  const dispatch = async (action: A) => {
    try {
      const newState = await reducer(state, action);
      setState(newState);
    } catch (err) {
      throw err;
    }
  };

  return [state, dispatch];
}

export enum StudentStateActionType {
  CREATE,
  UPDATE,
  DELETE,
  REINITIALIZE,
}

interface StudentStateBaseAction {
  type: StudentStateActionType;
}

interface StudentCreateAction extends StudentStateBaseAction {
  type: StudentStateActionType.CREATE;
  data: StudentDTO;
}

interface StudentUpdateAction extends StudentStateBaseAction {
  type: StudentStateActionType.UPDATE;
  data: {
    studentId: string;
    dto: StudentDTO;
  };
}

interface StudentDeleteAction extends StudentStateBaseAction {
  type: StudentStateActionType.DELETE;
  data: string;
}

interface ReinitializeStateAction extends StudentStateBaseAction {
  type: StudentStateActionType.REINITIALIZE;
  data: StudentoverviewState;
}

type StudentStateAction =
  | StudentCreateAction
  | StudentUpdateAction
  | StudentDeleteAction
  | ReinitializeStateAction;

interface StudentoverviewState {
  students: Student[];
  teams?: Team[];
}

interface StudentoverviewContextType {
  state: StudentoverviewState;
  dispatch: (action: StudentStateAction) => Promise<void>;
}

export type StudentStateDispatcher = AsyncDispatch<StudentStateAction>;

async function createTeamIfNeccessary(
  tutorialId: string,
  team: string | undefined
): Promise<string | undefined> {
  if (team === CREATE_NEW_TEAM_VALUE) {
    const createdTeam = await createTeam(tutorialId, { students: [] });
    return createdTeam.id;
  } else {
    return team;
  }
}

async function reduceCreateStudent(
  state: StudentoverviewState,
  action: StudentCreateAction
): Promise<StudentoverviewState> {
  const { team, tutorial, ...dto } = action.data;

  const teamId = await createTeamIfNeccessary(tutorial, team);

  const studentDTO: StudentDTO = {
    ...dto,
    tutorial,
    team: teamId || undefined,
  };

  const response = await createStudent(studentDTO);
  const teams = state.teams ? await getTeamsOfTutorial(tutorial) : undefined;

  return {
    ...state,
    students: [...state.students, response].sort(sortByName),
    teams,
  };
}

async function reduceUpdateStudent(
  state: StudentoverviewState,
  action: StudentUpdateAction
): Promise<StudentoverviewState> {
  const { team, tutorial, ...dto } = action.data.dto;
  const teamId = await createTeamIfNeccessary(tutorial, team);

  const studentDTO: StudentDTO = {
    ...dto,
    tutorial,
    team: teamId,
  };

  const response = await editStudent(action.data.studentId, studentDTO);
  const teams = state.teams ? await getTeamsOfTutorial(tutorial) : undefined;

  const students = state.students
    .map(stud => {
      if (stud.id === action.data.studentId) {
        return response;
      }

      return stud;
    })
    .sort(sortByName);

  return { ...state, students, teams };
}

async function reduceDeleteStudent(
  state: StudentoverviewState,
  action: StudentDeleteAction
): Promise<StudentoverviewState> {
  await deleteStudent(action.data);

  return { ...state, students: state.students.filter(s => s.id !== action.data) };
}

async function reducer(
  state: StudentoverviewState,
  action: StudentStateAction
): Promise<StudentoverviewState> {
  switch (action.type) {
    case StudentStateActionType.CREATE:
      return reduceCreateStudent(state, action);

    case StudentStateActionType.UPDATE:
      return reduceUpdateStudent(state, action);

    case StudentStateActionType.DELETE:
      return reduceDeleteStudent(state, action);

    case StudentStateActionType.REINITIALIZE:
      return { ...action.data };

    default:
      return state;
  }
}

const initialState: StudentoverviewState = {
  students: [],
};

const StudentoverviewContext = React.createContext<StudentoverviewContextType>({
  state: initialState,
  dispatch: () =>
    new Promise((_, reject) =>
      reject('Student context dispatch used outside a StudentoverviewContextProvider.')
    ),
});

interface Props {
  students: Student[];
  teams?: Team[];
}

export function useStudentContext(): [StudentoverviewState, StudentStateDispatcher] {
  const { state, dispatch } = useContext(StudentoverviewContext);

  return [state, dispatch];
}

function StudentoverviewContextProvider({
  children,
  students,
  teams,
}: PropsWithChildren<Props>): JSX.Element {
  const [state, dispatch] = useAsyncReducer(reducer, { students, teams });

  useEffect(() => {
    dispatch({
      type: StudentStateActionType.REINITIALIZE,
      data: { students, teams },
    });
  }, [students, teams]);

  return (
    <StudentoverviewContext.Provider value={{ state, dispatch }}>
      {children}
    </StudentoverviewContext.Provider>
  );
}

export default StudentoverviewContextProvider;
