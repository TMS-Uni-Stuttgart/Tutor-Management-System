import {
  CircularProgress,
  createStyles,
  makeStyles,
  Paper,
  Theme,
  useTheme,
} from '@material-ui/core';
import GREEN from '@material-ui/core/colors/green';
import RED from '@material-ui/core/colors/red';
import React from 'react';
import Chart from 'react-google-charts';
import { StudentByTutorialSlotSummaryMap } from '../../../typings/types';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    statsPaper: {
      margin: theme.spacing(2),
      padding: '2px',
    },
    chart: {
      width: '100%',
      height: '100%',
    },
    loader: {
      position: 'absolute',
      top: '50%',
      left: '50%',
    },
  })
);

interface Props {
  studentsByTutorialSummary: StudentByTutorialSlotSummaryMap;
}

function AdminStatsCard({ studentsByTutorialSummary: summaries }: Props): JSX.Element {
  const classes = useStyles();
  const theme = useTheme();

  function getScheinPassedStatsOfAllStudents() {
    const data: [string, number, number][] = [];

    Object.entries(summaries).forEach(([slot, summaries]) => {
      let passed = 0;
      let notPassed = 0;
      summaries.forEach((summary) => {
        if (summary.passed) {
          passed += 1;
        } else {
          notPassed += 1;
        }
      });

      const percentage = (passed / (passed + notPassed)) * 100;

      data.push([slot, percentage, 100 - percentage]);
    });

    const headedData = [['Slot', 'Bestanden', 'Nicht Bestanden'], ...data];
    return headedData;
  }

  return (
    <Paper className={classes.statsPaper}>
      <Chart
        className={classes.chart}
        chartType='ColumnChart'
        loader={<CircularProgress className={classes.loader} />}
        data={getScheinPassedStatsOfAllStudents()}
        options={{
          fontName: theme.typography.fontFamily,
          fontSize: theme.typography.fontSize,
          colors: [GREEN[600], RED[600]],
          title: 'Aktueller Scheinstatus aller Studierenden',
          legend: 'none',
          isStacked: true,
          hAxis: {
            title: 'Tutorium',
          },
          vAxis: {
            title: 'Prozentsatz bestanden',
          },
        }}
      />
    </Paper>
  );
}

export default AdminStatsCard;
