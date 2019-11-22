import { TextField } from '@material-ui/core';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { AccountSearch as SearchIcon } from 'mdi-material-ui';
import { useSnackbar, WithSnackbarProps } from 'notistack';
import React, { useState } from 'react';
import { ScheinCriteriaSummary } from 'shared/dist/model/ScheinCriteria';
import { Student } from 'shared/dist/model/Student';
import { Tutorial } from 'shared/dist/model/Tutorial';
import StudentForm, {
  getInitialStudentFormState,
  StudentFormSubmitCallback,
} from '../../../components/forms/StudentForm';
import LoadingSpinner from '../../../components/LoadingSpinner';
import TableWithForm from '../../../components/TableWithForm';
import TableWithPadding from '../../../components/TableWithPadding';
import { getTeamsOfTutorial } from '../../../hooks/fetching/Team';
import ExtendableStudentRow from '../../management/components/ExtendableStudentRow';
import { getFilteredStudents } from './Studentoverview.helpers';
import { StudentStoreDispatcher, useStudentStore } from './StudentStore';
import { StudentStoreActionType } from './StudentStore.actions';
import { useDialog, DialogHelpers } from '../../../hooks/DialogService';
import { getNameOfEntity } from 'shared/dist/util/helpers';
import TutorialChangeForm, {
  TutorialChangeFormSubmitCallback,
} from '../../../components/forms/TutorialChangeForm';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    searchField: {
      // width: '75%',
      flex: 1,
    },
    dialogDeleteButton: {
      color: theme.palette.error.main,
    },
    topBar: {
      display: 'flex',
    },
  })
);

type SummariesByStudent = { [studentId: string]: ScheinCriteriaSummary };

interface HandlerParams {
  tutorialId?: string;
  dispatch: StudentStoreDispatcher;
  enqueueSnackbar: WithSnackbarProps['enqueueSnackbar'];
}

interface Props {
  tutorials?: Tutorial[];
  summaries: SummariesByStudent;
  allowChangeTutorial?: boolean;
  additionalTopBarItem?: React.ReactNode;
}

function handleCreateStudent({
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

function handleEditStudent({
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

function handleDeleteStudent({
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

function handleChangeTutorial({
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

function Studentoverview({
  tutorials,
  summaries,
  allowChangeTutorial,
  additionalTopBarItem,
}: Props): JSX.Element {
  const classes = useStyles();
  const [filterText, setFilterText] = useState<string>('');

  const dialog = useDialog();
  const [{ students, teams, tutorialId, isInitialized }, dispatch] = useStudentStore();
  const { enqueueSnackbar } = useSnackbar();

  const handlerParams: HandlerParams = { tutorialId, dispatch, enqueueSnackbar };

  if (!isInitialized) {
    return <LoadingSpinner />;
  }

  function openEditDialog(student: Student) {
    dialog.show({
      title: 'Student bearbeiten',
      content: (
        <StudentForm
          student={student}
          otherStudents={students.filter(s => s.id !== student.id)}
          teams={teams}
          onSubmit={handleEditStudent({ student, dialog, ...handlerParams })}
          onCancelClicked={() => dialog.hide()}
        />
      ),
      DialogProps: {
        maxWidth: 'lg',
      },
    });
  }

  function openDeleteDialog(student: Student) {
    const nameOfStudent = getNameOfEntity(student);

    dialog.show({
      title: 'Student löschen',
      content: `Soll der Student "${nameOfStudent}" wirklich gelöscht werden? Diese Aktion kann nicht rückgängig gemacht werden!`,
      actions: [
        {
          label: 'Nicht löschen',
          onClick: () => dialog.hide(),
        },
        {
          label: 'Löschen',
          onClick: handleDeleteStudent({ student, dialog, ...handlerParams }),
          buttonProps: {
            className: classes.dialogDeleteButton,
          },
        },
      ],
    });
  }

  function openChangeTutorialDialog(student: Student) {
    if (!tutorials) {
      return;
    }

    dialog.show({
      title: 'In folgendes Tutorium wechseln',
      content: (
        <TutorialChangeForm
          allTutorials={tutorials}
          tutorial={student.tutorial}
          onSubmit={handleChangeTutorial({
            student,
            enqueueSnackbar,
            dialog,
            dispatch,
            tutorialId,
          })}
          onCancel={() => dialog.hide()}
        />
      ),
    });
  }

  const TopBarContent = (
    <>
      <TextField
        variant='outlined'
        label='Suche'
        onChange={e => setFilterText(e.target.value)}
        className={classes.searchField}
        InputProps={{
          startAdornment: <SearchIcon color='disabled' />,
        }}
      />

      {additionalTopBarItem}
    </>
  );

  const createRowFromItem = (student: Student) => (
    <ExtendableStudentRow
      student={student}
      summary={summaries[student.id]}
      onEditStudentClicked={openEditDialog}
      showTutorial={!!tutorials}
      tutorials={tutorials}
      onDeleteStudentClicked={openDeleteDialog}
      onChangeTutorialClicked={allowChangeTutorial ? openChangeTutorialDialog : undefined}
    />
  );

  return !!tutorialId ? (
    <TableWithForm
      title='Neuen Studierenden anlegen'
      placeholder='Keine Studierenden vorhanden.'
      form={
        <StudentForm
          teams={teams}
          otherStudents={students}
          onSubmit={handleCreateStudent(handlerParams)}
        />
      }
      items={getFilteredStudents(students, filterText)}
      createRowFromItem={createRowFromItem}
      topBarContent={TopBarContent}
    />
  ) : (
    <>
      <div className={classes.topBar}>{TopBarContent}</div>

      <TableWithPadding
        placeholder='Keine Studierenden vorhanden'
        items={getFilteredStudents(students, filterText)}
        createRowFromItem={createRowFromItem}
      />
    </>
  );
}

export default Studentoverview;
