import { Box, TextField } from '@material-ui/core';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { AccountSearch as SearchIcon } from 'mdi-material-ui';
import { useSnackbar } from 'notistack';
import React, { ChangeEvent, useState } from 'react';
import { Student } from 'shared/model/Student';
import { Tutorial } from 'shared/model/Tutorial';
import { getNameOfEntity } from 'shared/util/helpers';
import CustomSelect from '../../../components/CustomSelect';
import StudentForm from '../../../components/forms/StudentForm';
import TutorialChangeForm from '../../../components/forms/TutorialChangeForm';
import LoadingSpinner from '../../../components/loading/LoadingSpinner';
import TableWithForm from '../../../components/TableWithForm';
import TableWithPadding from '../../../components/TableWithPadding';
import { useDialog } from '../../../hooks/DialogService';
import { useStudentStore } from '../student-store/StudentStore';
import StudentRow from './components/StudentRow';
import {
  getFilteredStudents,
  handleChangeTutorial,
  handleCreateStudent,
  handleDeleteStudent,
  handleEditStudent,
  HandlerParams,
  StudentSortOption,
} from './Studentoverview.helpers';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    searchField: {
      flex: 1,
    },
    sortSelect: {
      marginLeft: theme.spacing(2),
      minWidth: '20%',
    },
    studentRow: {
      flexGrow: 1,
    },
    dialogDeleteButton: {
      color: theme.palette.error.main,
    },
  })
);

interface Props {
  tutorials?: Tutorial[];
  allowChangeTutorial?: boolean;
  additionalTopBarItem?: React.ReactNode;
}

function Studentoverview({
  tutorials,
  allowChangeTutorial,
  additionalTopBarItem,
}: Props): JSX.Element {
  const classes = useStyles();

  const [filterText, setFilterText] = useState<string>('');
  const [sortOption, setSortOption] = useState<StudentSortOption>(StudentSortOption.ALPHABETICAL);

  const dialog = useDialog();
  const [{ students, teams, tutorialId, isInitialized, summaries }, dispatch] = useStudentStore();
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
    <StudentRow
      className={classes.studentRow}
      student={student}
      scheinStatus={summaries[student.id]}
      onEdit={openEditDialog}
      onDelete={openDeleteDialog}
      onChangeTutorial={allowChangeTutorial ? openChangeTutorialDialog : undefined}
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
      <Box display='flex'>{TopBarContent}</Box>

      <TableWithPadding
        placeholder='Keine Studierenden vorhanden'
        items={getFilteredStudents(students, filterText, sortOption)}
        createRowFromItem={createRowFromItem}
      />
    </>
  );
}

export default Studentoverview;
