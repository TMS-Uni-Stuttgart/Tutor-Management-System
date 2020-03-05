import { Theme } from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import _ from 'lodash';
import React from 'react';
import { RouteComponentProps, withRouter } from 'react-router';
import { getNameOfEntity } from 'shared/util/helpers';
import { Student } from '../../model/Student';
import Studentoverview from './student-overview/Studentoverview';
import StudentoverviewStoreProvider from './student-store/StudentStore';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
      flexDirection: 'column',
      maxHeight: '100%',
      position: 'relative',
    },
    dialogDeleteButton: {
      color: theme.palette.error.main,
    },
    searchField: {
      width: '75%',
    },
  })
);

interface Params {
  tutorialId: string;
}

type PropType = RouteComponentProps<Params>;

function unifyFilterableText(text: string): string {
  return _.deburr(text).toLowerCase();
}

export function getFilteredStudents(students: Student[], filterText: string): Student[] {
  if (!filterText) {
    return students;
  }

  return students.filter(s => {
    const name = getNameOfEntity(s, { firstNameFirst: true });

    return unifyFilterableText(name).includes(unifyFilterableText(filterText));
  });
}

function TutorStudentmanagement({ match: { params } }: PropType): JSX.Element {
  const classes = useStyles();
  const tutorialId: string = params.tutorialId;

  return (
    <StudentoverviewStoreProvider tutorialId={tutorialId}>
      <div className={classes.root}>{<Studentoverview />}</div>
    </StudentoverviewStoreProvider>
  );
}

export default withRouter(TutorStudentmanagement);
