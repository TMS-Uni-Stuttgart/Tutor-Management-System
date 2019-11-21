import { TextField } from '@material-ui/core';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { AccountSearch as SearchIcon } from 'mdi-material-ui';
import { useSnackbar, WithSnackbarProps } from 'notistack';
import React, { useState } from 'react';
import { ScheinCriteriaSummary } from 'shared/dist/model/ScheinCriteria';
import { Student, StudentStatus } from 'shared/dist/model/Student';
import { Tutorial } from 'shared/dist/model/Tutorial';
import StudentForm, { StudentFormSubmitCallback, getInitialStudentFormState } from '../../../components/forms/StudentForm';
import TableWithForm from '../../../components/TableWithForm';
import TableWithPadding from '../../../components/TableWithPadding';
import ExtendableStudentRow from '../../management/components/ExtendableStudentRow';
import { getFilteredStudents } from './Studentoverview.helpers';
import { useStudentStore, StudentStoreDispatcher } from './StudentStore';
import { StudentStoreActionType } from './StudentStore.actions';
import LoadingSpinner from '../../../components/LoadingSpinner';
import { getTeamsOfTutorial } from '../../../hooks/fetching/Team';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    searchField: {
      width: '75%',
    },
  })
);

type SummariesByStudent = { [studentId: string]: ScheinCriteriaSummary };

interface Props {
  tutorials?: Tutorial[];
  summaries: SummariesByStudent;
  allowChangeTutorial?: boolean;
  // handleCreateStudent?: StudentFormSubmitCallback;
  // handleEditStudent: (student: StudentWithFetchedTeam) => void;
  // handleDeleteStudent: (student: StudentWithFetchedTeam) => void;
  // handleChangeTutorial?: (student: StudentWithFetchedTeam) => void;
}

function handleCreateStudent(
  tutorialId: string,
  dispatch: StudentStoreDispatcher,
  enqueueSnackbar: WithSnackbarProps['enqueueSnackbar']
): StudentFormSubmitCallback {
  return async (
    { firstname, lastname, matriculationNo, email, courseOfStudies, team },
    { setSubmitting, resetForm }
  ) => {
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
          status: StudentStatus.ACTIVE, // TODO: Add field in form.
          team,
          tutorial: tutorialId,
        },
      });
      const teams = await getTeamsOfTutorial(tutorialId);

      resetForm({ values: getInitialStudentFormState(teams) });
      enqueueSnackbar('Student wurde erfolgreich erstellt.', { variant: 'success' });
    } catch (reason) {
      console.error(reason);
      enqueueSnackbar('Student konnte nicht erstellt werden.', { variant: 'error' });
    } finally {
      setSubmitting(false);
    }
  };
}

function handleEditStudent() {
  console.error('[handleEditStudent] -- Not implemented');
}

function handleDeleteStudent() {
  console.error('[handleDeleteStudent] -- Not implemented');
}

function handleChangeTutorial() {
  console.error('[handleChangeTutorial] -- Not implemented');
}

function Studentoverview({ tutorials, summaries, allowChangeTutorial }: Props): JSX.Element {
  const classes = useStyles();
  const [filterText, setFilterText] = useState<string>('');
  const [{ students, teams, tutorialId, isInitialized }, dispatch] = useStudentStore();
  const { enqueueSnackbar } = useSnackbar();

  const TopBarContent = (
    <TextField
      variant='outlined'
      label='Suche'
      onChange={e => setFilterText(e.target.value)}
      className={classes.searchField}
      InputProps={{
        startAdornment: <SearchIcon color='disabled' />,
      }}
    />
  );

  const createRowFromItem = (student: Student) => (
    <ExtendableStudentRow
      student={student}
      summary={summaries[student.id]}
      onEditStudentClicked={handleEditStudent}
      showTutorial={!!tutorials}
      tutorials={tutorials}
      onDeleteStudentClicked={handleDeleteStudent}
      onChangeTutorialClicked={allowChangeTutorial ? handleChangeTutorial : undefined}
    />
  );

  if (!isInitialized) {
    return <LoadingSpinner />;
  }

  return !!tutorialId ? (
    <TableWithForm
      title='Neuen Studierenden anlegen'
      placeholder='Keine Studierenden vorhanden.'
      form={
        <StudentForm
          teams={teams}
          otherStudents={students}
          onSubmit={handleCreateStudent(tutorialId, dispatch, enqueueSnackbar)}
        />
      }
      items={getFilteredStudents(students, filterText)}
      createRowFromItem={createRowFromItem}
      topBarContent={TopBarContent}
    />
  ) : (
    <TableWithPadding
      placeholder='Keine Studierenden vorhanden'
      items={getFilteredStudents(students, filterText)}
      createRowFromItem={createRowFromItem}
    />
  );
}

export default Studentoverview;
