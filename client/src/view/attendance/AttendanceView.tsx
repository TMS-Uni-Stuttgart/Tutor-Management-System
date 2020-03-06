import { Typography } from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import React, { useEffect, useState } from 'react';
import { RouteComponentProps, withRouter } from 'react-router';
import { TutorialWithFetchedStudents } from '../../typings/types';
import AttendanceManager from './AttendanceManager';
import LoadingSpinner from '../../components/loading/LoadingSpinner';
import { Tutorial } from '../../model/Tutorial';
import { getTutorial } from '../../hooks/fetching/Tutorial';

const useStyles = makeStyles(() =>
  createStyles({
    root: {
      position: 'relative',
    },
  })
);

interface Params {
  tutorialId: string;
}

type Props = RouteComponentProps<Params>;

function AttendanceView({ match }: Props): JSX.Element {
  const classes = useStyles();
  const [isLoading, setIsLoading] = useState(false);
  const [tutorial, setTutorial] = useState<Tutorial>();
  const { params } = match;

  useEffect(() => {
    setIsLoading(true);
    getTutorial(params.tutorialId).then(response => {
      setTutorial(response);
      setIsLoading(false);
    });
  }, [getTutorial, params.tutorialId]);

  return (
    <div className={classes.root}>
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <>
          {tutorial ? (
            <AttendanceManager tutorial={tutorial} />
          ) : (
            <Typography variant='h6'>Tutorialdaten werden geladen...</Typography>
          )}
        </>
      )}
    </div>
  );
}

export default withRouter(AttendanceView);
