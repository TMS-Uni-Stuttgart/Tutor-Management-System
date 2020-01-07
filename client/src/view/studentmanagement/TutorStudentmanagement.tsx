import { Theme } from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import _ from 'lodash';
import { withSnackbar, WithSnackbarProps } from 'notistack';
import React, { useEffect, useState } from 'react';
import { RouteComponentProps, withRouter } from 'react-router';
import { ScheinCriteriaSummary } from 'shared/dist/model/ScheinCriteria';
import { getNameOfEntity } from 'shared/dist/util/helpers';
import { getScheinCriteriaSummariesOfAllStudentsOfTutorial } from '../../hooks/fetching/Tutorial';
import { StudentWithFetchedTeam } from '../../typings/types';
import Studentoverview from './Studentoverview/Studentoverview';
import StudentoverviewStoreProvider from './StudentStore/StudentStore';

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

type PropType = WithSnackbarProps & RouteComponentProps<Params>;

function unifyFilterableText(text: string): string {
  return _.deburr(text).toLowerCase();
}

export function getFilteredStudents(
  students: StudentWithFetchedTeam[],
  filterText: string
): StudentWithFetchedTeam[] {
  if (!filterText) {
    return students;
  }

  return students.filter(s => {
    const name = getNameOfEntity(s, { lastNameFirst: false });

    return unifyFilterableText(name).includes(unifyFilterableText(filterText));
  });
}

function TutorStudentmanagement({ match: { params }, enqueueSnackbar }: PropType): JSX.Element {
  const classes = useStyles();

  const [summaries, setSummaries] = useState<{ [studentId: string]: ScheinCriteriaSummary }>({});

  const tutorialId: string = params.tutorialId;

  useEffect(() => {
    (async function() {
      getScheinCriteriaSummariesOfAllStudentsOfTutorial(tutorialId)
        .then(response => setSummaries(response))
        .catch(() => {
          enqueueSnackbar('Konnte Ergebnisse der Scheinkriterien nicht abrufen.', {
            variant: 'error',
          });

          return [];
        });
    })();
  }, [tutorialId, enqueueSnackbar]);

  return (
    <StudentoverviewStoreProvider tutorialId={tutorialId}>
      <div className={classes.root}>{<Studentoverview summaries={summaries} />}</div>
    </StudentoverviewStoreProvider>
  );
}

export default withRouter(withSnackbar(TutorStudentmanagement));
