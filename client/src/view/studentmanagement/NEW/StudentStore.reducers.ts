import { StudentDTO } from 'shared/dist/model/Student';
import { sortByName } from 'shared/dist/util/helpers';
import { CREATE_NEW_TEAM_VALUE } from '../../../components/forms/StudentForm';
import { createStudent, deleteStudent, editStudent } from '../../../hooks/fetching/Student';
import { createTeam, getTeamsOfTutorial } from '../../../hooks/fetching/Team';
import {
  StudentStoreActionType,
  StudentCreateAction,
  StudentUpdateAction,
  StudentDeleteAction,
  StudentReinitializeAction,
} from './StudentStore.actions';
import { AsyncDispatch } from './AsyncReducer';
import { StudentStoreAction } from './StudentStore.actions';
import { StudentStore } from './StudentStore';
import { getStudentsOfTutorial } from '../../../hooks/fetching/Tutorial';
import { stringTypeAnnotation } from '@babel/types';

export type StudentStateDispatcher = AsyncDispatch<StudentStoreAction>;

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
  state: StudentStore,
  action: StudentCreateAction
): Promise<StudentStore> {
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
  state: StudentStore,
  action: StudentUpdateAction
): Promise<StudentStore> {
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
  state: StudentStore,
  action: StudentDeleteAction
): Promise<StudentStore> {
  await deleteStudent(action.data.studentId);

  return { ...state, students: state.students.filter(s => s.id !== action.data.studentId) };
}

async function reduceReinitializeStore(
  state: StudentStore,
  action: StudentReinitializeAction
): Promise<StudentStore> {
  const {
    data: { tutorialId },
  } = action;

  if (tutorialId === state.tutorialId) {
    return state;
  }

  if (!!tutorialId) {
    const [students, teams] = await Promise.all([
      getStudentsOfTutorial(tutorialId),
      getTeamsOfTutorial(tutorialId),
    ]);

    return { students, teams, isInitialized: true, tutorialId };
  } else {
    // TODO: Implement me.
    return state;
  }
}

async function studentStoreReducer(
  state: StudentStore,
  action: StudentStoreAction
): Promise<StudentStore> {
  switch (action.type) {
    case StudentStoreActionType.CREATE:
      return reduceCreateStudent(state, action);

    case StudentStoreActionType.UPDATE:
      return reduceUpdateStudent(state, action);

    case StudentStoreActionType.DELETE:
      return reduceDeleteStudent(state, action);

    case StudentStoreActionType.REINITIALIZE:
      return reduceReinitializeStore(state, action);

    default:
      return state;
  }
}

export default studentStoreReducer;
