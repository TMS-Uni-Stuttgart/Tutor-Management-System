import { TextField } from '@material-ui/core';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import React from 'react';
import { ScheinCriteriaSummary } from 'shared/dist/model/ScheinCriteria';
import { Team } from 'shared/dist/model/Team';
import StudentForm, { StudentFormSubmitCallback } from '../../components/forms/StudentForm';
import LoadingSpinner from '../../components/LoadingSpinner';
import TableWithForm from '../../components/TableWithForm';
import { StudentWithFetchedTeam } from '../../typings/types';
import ExtendableStudentRow from '../management/components/ExtendableStudentRow';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
      flexDirection: 'column',
      maxHeight: '100%',
      position: 'relative',
    },
  })
);

interface Props {
  students: StudentWithFetchedTeam[];
  teams: Team[];
  summaries: { [studentId: string]: ScheinCriteriaSummary };
  onCreateStudent: StudentFormSubmitCallback;
  onEditStudent: (student: StudentWithFetchedTeam) => void;
  onDeleteStudent: (student: StudentWithFetchedTeam) => void;
}

function StudentList({
  students,
  teams,
  summaries,
  onCreateStudent,
  onEditStudent,
  onDeleteStudent,
}: Props): JSX.Element {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      {students.length === 0 ? (
        <LoadingSpinner />
      ) : (
        <TableWithForm
          title='Neuen Studierenden anlegen'
          placeholder='Keine Studierenden vorhanden.'
          form={<StudentForm teams={teams} otherStudents={students} onSubmit={onCreateStudent} />}
          items={students}
          createRowFromItem={student => (
            <ExtendableStudentRow
              student={student}
              summary={summaries[student.id]}
              onEditStudentClicked={onEditStudent}
              onDeleteStudentClicked={onDeleteStudent}
            />
          )}
          topBarContent={<TextField variant='outlined' label='Suche' />}
        />
      )}
    </div>
  );
}

export default StudentList;
