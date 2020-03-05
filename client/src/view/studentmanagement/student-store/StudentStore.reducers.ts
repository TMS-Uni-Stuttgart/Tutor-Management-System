import { IStudentDTO } from 'shared/model/Student';
import { sortByName } from 'shared/util/helpers';
import { CREATE_NEW_TEAM_VALUE } from '../../../components/forms/StudentForm';
import {
  createStudent,
  deleteStudent,
  editStudent,
  getAllStudents,
} from '../../../hooks/fetching/Student';
import { createTeam, getTeamsOfTutorial } from '../../../hooks/fetching/Team';
import { getStudentsOfTutorial } from '../../../hooks/fetching/Tutorial';
import { AsyncDispatch } from '../../../util/AsyncReducer';
import { StudentStore } from './StudentStore';
import {
  StudentCreateAction,
  StudentDeleteAction,
  StudentReinitializeStartAction,
  StudentStoreAction,
  StudentStoreActionType,
  StudentUpdateAction,
} from './StudentStore.actions';
import {
  getScheinCriteriaSummariesOfAllStudentsOfTutorial,
  getScheinCriteriaSummaryOfAllStudents,
} from '../../../hooks/fetching/Scheincriteria';

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

  const studentDTO: IStudentDTO = {
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

  const studentDTO: IStudentDTO = {
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
  action: StudentReinitializeStartAction
): Promise<StudentStore> {
  const {
    data: { tutorialId },
  } = action;

  if (tutorialId === state.tutorialId) {
    return state;
  }

  if (!!tutorialId) {
    const [students, teams, summaries] = await Promise.all([
      getStudentsOfTutorial(tutorialId),
      getTeamsOfTutorial(tutorialId),
      getScheinCriteriaSummariesOfAllStudentsOfTutorial(tutorialId),
    ]);

    students.sort(sortByName);

    return { ...state, students, teams, isInitialized: true, tutorialId, summaries };
  } else {
    const [students, summaries] = await Promise.all([
      getAllStudents(),
      getScheinCriteriaSummaryOfAllStudents(),
    ]);

    students.sort(sortByName);

    return {
      ...state,
      students,
      teams: undefined,
      tutorialId: undefined,
      isInitialized: true,
      summaries,
    };
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

    case StudentStoreActionType.REINITIALIZE_START:
      reduceReinitializeStore(state, action).then(state => {
        action.data.dispatch({
          type: StudentStoreActionType.REINITIALIZE_FINISHED,
          data: state,
        });
      });

      return { ...state, isInitialized: false, tutorialId: action.data.tutorialId };

    case StudentStoreActionType.REINITIALIZE_FINISHED:
      return { ...action.data, isInitialized: true };

    default:
      return state;
  }
}

export default studentStoreReducer;
