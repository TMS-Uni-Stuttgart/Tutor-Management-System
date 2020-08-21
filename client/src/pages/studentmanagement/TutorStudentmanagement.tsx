import { Theme } from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import React from 'react';
import { useParams } from 'react-router';
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

function TutorStudentmanagement(): JSX.Element {
  const { tutorialId } = useParams<{ tutorialId: string }>();
  const classes = useStyles();

  return (
    <StudentoverviewStoreProvider tutorialId={tutorialId}>
      <div className={classes.root}>{<Studentoverview />}</div>
    </StudentoverviewStoreProvider>
  );
}

export default TutorStudentmanagement;
