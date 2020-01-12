import _ from 'lodash';
import { getNameOfEntity, sortByName } from 'shared/dist/util/helpers';
import { StudentWithFetchedTeam } from '../../../typings/types';
import { StudentStatus, Student } from 'shared/dist/model/Student';
import { StudentStoreDispatcher } from '../student-store/StudentStore';
import { WithSnackbarProps } from 'notistack';
import {
  StudentFormSubmitCallback,
  getInitialStudentFormState,
} from '../../../components/forms/StudentForm';
import { StudentStoreActionType } from '../student-store/StudentStore.actions';
import { getTeamsOfTutorial } from '../../../hooks/fetching/Team';
import { DialogHelpers } from '../../../hooks/DialogService';
import { TutorialChangeFormSubmitCallback } from '../../../components/forms/TutorialChangeForm';

export interface HandlerParams {
  tutorialId?: string;
  dispatch: StudentStoreDispatcher;
  enqueueSnackbar: WithSnackbarProps['enqueueSnackbar'];
}

export enum StudentSortOption {
  ALPHABETICAL = 'Alphabetisch',
  ACTIVE_FIRST = 'Aktive nach oben',
}

function unifyFilterableText(text: string): string {
  return _.deburr(text).toLowerCase();
}

export function getFilteredStudents(
  students: StudentWithFetchedTeam[],
  filterText: string,
  sortOption: StudentSortOption
): StudentWithFetchedTeam[] {
  return students
    .filter(s => {
      if (!filterText) {
        return true;
      }

      const name = getNameOfEntity(s, { lastNameFirst: false });

      return unifyFilterableText(name).includes(unifyFilterableText(filterText));
    })
    .sort((a, b) => {
      switch (sortOption) {
        case StudentSortOption.ALPHABETICAL:
          return sortByName(a, b);

        case StudentSortOption.ACTIVE_FIRST:
          if (a.status !== b.status) {
            return a.status === StudentStatus.ACTIVE ? -1 : 1;
          } else {
            return sortByName(a, b);
          }

        default:
          return sortByName(a, b);
      }
    });
}

export function handleCreateStudent({
  tutorialId,
  dispatch,
  enqueueSnackbar,
}: HandlerParams): StudentFormSubmitCallback {
  return async (
    { firstname, lastname, matriculationNo, email, courseOfStudies, team, status },
    { setSubmitting, resetForm }
  ) => {
    if (!tutorialId) {
      return;
    }

    setSubmitting(true);
    try {
      await dispatch({
        type: StudentStoreActionType.CREATE,
        data: {
          firstname,
          lastname,
          matriculationNo,
          email,
          courseOfStudies,
          status,
          team,
          tutorial: tutorialId,
        },
      });
      const teams = await getTeamsOfTutorial(tutorialId);

      resetForm({ values: getInitialStudentFormState(teams) });
      enqueueSnackbar('Student/in wurde erfolgreich erstellt.', { variant: 'success' });
    } catch (reason) {
      console.error(reason);
      enqueueSnackbar('Student/in konnte nicht erstellt werden.', { variant: 'error' });
    } finally {
      setSubmitting(false);
    }
  };
}

export function handleEditStudent({
  student,
  dialog,
  tutorialId,
  dispatch,
  enqueueSnackbar,
}: HandlerParams & { student: Student; dialog: DialogHelpers }): StudentFormSubmitCallback {
  return async (
    { firstname, lastname, matriculationNo, email, courseOfStudies, team, status },
    { setSubmitting }
  ) => {
    try {
      setSubmitting(true);
      await dispatch({
        type: StudentStoreActionType.UPDATE,
        data: {
          studentId: student.id,
          dto: {
            firstname,
            lastname,
            matriculationNo,
            email,
            courseOfStudies,
            status,
            team,
            tutorial: tutorialId || student.tutorial,
          },
        },
      });

      enqueueSnackbar('Student/in wurde erfolgreich gespeichert.', { variant: 'success' });
      dialog.hide();
    } catch (reason) {
      console.error(reason);
      enqueueSnackbar('Student/in konnte nicht gespeichert werden.', { variant: 'error' });
      setSubmitting(false);
    }
  };
}

export function handleDeleteStudent({
  student,
  dialog,
  dispatch,
  enqueueSnackbar,
}: HandlerParams & { student: Student; dialog: DialogHelpers }) {
  return async () => {
    try {
      await dispatch({
        type: StudentStoreActionType.DELETE,
        data: {
          studentId: student.id,
        },
      });

      enqueueSnackbar('Student/in wurde erfolgreich gelöscht.', { variant: 'success' });
    } catch (reason) {
      console.error(reason);
      enqueueSnackbar('Student/in konnte nicht gelöscht werden.', { variant: 'error' });
    } finally {
      dialog.hide();
    }
  };
}

export function handleChangeTutorial({
  student,
  dialog,
  dispatch,
  enqueueSnackbar,
}: HandlerParams & { student: Student; dialog: DialogHelpers }): TutorialChangeFormSubmitCallback {
  return async ({ tutorial }) => {
    if (tutorial === student.tutorial) {
      return;
    }

    try {
      await dispatch({
        type: StudentStoreActionType.UPDATE,
        data: {
          studentId: student.id,
          dto: {
            ...student,
            team: student.team ? student.team.id : undefined,
            tutorial,
          },
        },
      });

      enqueueSnackbar('Tutorium wurde erfolgreich geändert.', { variant: 'success' });
      dialog.hide();
    } catch (reason) {
      console.error(reason);
      enqueueSnackbar('Tutorium konnte nicht geändert werden.', { variant: 'error' });
    }
  };
}
