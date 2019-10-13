import { createStyles, makeStyles, Paper, Theme, Typography, IconButton } from '@material-ui/core';
import React from 'react';
import { TutorialSummaryInfo } from '../Dashboard';
import ScheinCriteriaStatsCard from './ScheinCrtieriaStatsCard';
import ScheinPassedStatsCard from './ScheinPassedStatsCard';
import TutorialStatsCard from './TutorialStatsCard';
import { getDisplayStringForTutorial } from '../../../util/helperFunctions';
import { Download as DownloadIcon } from 'mdi-material-ui';
import { Tutorial } from 'shared/dist/model/Tutorial';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    tutorialHeading: {
      display: 'flex',
      justifyItems: 'center',
      padding: theme.spacing(1.5),
      margin: theme.spacing(1, 0),
    },
    iconButton: {
      marginLeft: 'auto',
    },
    cardsContainer: {
      display: 'grid',
      // padding: theme.spacing(1),
      margin: theme.spacing(1),
      gridTemplateColumns: 'repeat(3, 1fr)',
      width: 'inherit',
    },
  })
);

interface TutorialStatisticsProps {
  value: TutorialSummaryInfo;
  onDownloadClicked: (tutorial: Tutorial) => void;
}

function TutorialStatistics({ value, onDownloadClicked }: TutorialStatisticsProps): JSX.Element {
  const classes = useStyles();
  const activeCriteria: string[] = [];

  Object.values(value.studentInfos).forEach(summary => {
    Object.values(summary.scheinCriteriaSummary).forEach(status => {
      if (!activeCriteria.includes(status.id)) {
        activeCriteria.push(status.id);
      }
    });
  });

  return (
    <>
      <Paper className={classes.tutorialHeading}>
        <Typography variant='h5'>{getDisplayStringForTutorial(value.tutorial)}</Typography>

        <IconButton
          size='small'
          className={classes.iconButton}
          onClick={() => onDownloadClicked(value.tutorial)}
        >
          <DownloadIcon />
        </IconButton>
      </Paper>
      <div className={classes.cardsContainer}>
        <TutorialStatsCard value={value} />
        {activeCriteria.length > 0 ? (
          <>
            <ScheinPassedStatsCard value={value} />
            <ScheinCriteriaStatsCard value={value} criteriaIds={activeCriteria} />
          </>
        ) : (
          <></>
        )}
      </div>
    </>
  );
}
export default TutorialStatistics;
