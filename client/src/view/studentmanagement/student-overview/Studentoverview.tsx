import { TextField } from '@material-ui/core';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { AccountSearch as SearchIcon } from 'mdi-material-ui';
import { useSnackbar, WithSnackbarProps } from 'notistack';
import React, { ChangeEvent, useState } from 'react';
import { ScheinCriteriaSummary } from 'shared/dist/model/ScheinCriteria';
import { Student } from 'shared/dist/model/Student';
import { Tutorial } from 'shared/dist/model/Tutorial';
import { getNameOfEntity } from 'shared/dist/util/helpers';
import CustomSelect from '../../../components/CustomSelect';
import StudentForm, {
  getInitialStudentFormState,
  StudentFormSubmitCallback,
} from '../../../components/forms/StudentForm';
import TutorialChangeForm, {
  TutorialChangeFormSubmitCallback,
} from '../../../components/forms/TutorialChangeForm';
import LoadingSpinner from '../../../components/LoadingSpinner';
import TableWithForm from '../../../components/TableWithForm';
import TableWithPadding from '../../../components/TableWithPadding';
import { DialogHelpers, useDialog } from '../../../hooks/DialogService';
import { getTeamsOfTutorial } from '../../../hooks/fetching/Team';
import ExtendableStudentRow from './components/ExtendableStudentRow';
import { StudentStoreDispatcher, useStudentStore } from '../student-store/StudentStore';
import { StudentStoreActionType } from '../student-store/StudentStore.actions';
import { getFilteredStudents, StudentSortOption } from './Studentoverview.helpers';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    searchField: {
      flex: 1,
    },
    sortSelect: {
      marginLeft: theme.spacing(2),
      minWidth: '20%',
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
  const [sortOption, setSortOption] = useState<StudentSortOption>(StudentSortOption.ALPHABETICAL);

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

  function handleSortOptionChange(e: ChangeEvent<{ name?: string; value: unknown }>) {
    if (typeof e.target.value !== 'string') {
      return;
    }

    if (e.target.value === sortOption) {
      return;
    }

    const selectedOption: StudentSortOption | undefined = Object.values(StudentSortOption).find(
      op => op === e.target.value
    );

    if (!selectedOption) {
      throw new Error('Selected filter option is not a valid one.');
    }

    setSortOption(selectedOption);
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

      <CustomSelect
        label='Sortieren nach...'
        emptyPlaceholder='Keine Sortieroptionen vorhanden.'
        className={classes.sortSelect}
        value={sortOption}
        items={Object.values(StudentSortOption)}
        itemToString={option => option}
        itemToValue={option => option}
        onChange={handleSortOptionChange}
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
      items={getFilteredStudents(students, filterText, sortOption)}
      createRowFromItem={createRowFromItem}
      topBarContent={TopBarContent}
    />
  ) : (
    <>
      <div className={classes.topBar}>{TopBarContent}</div>

      <TableWithPadding
        placeholder='Keine Studierenden vorhanden'
        items={getFilteredStudents(students, filterText, sortOption)}
        createRowFromItem={createRowFromItem}
      />
    </>
  );
}

export default Studentoverview;
