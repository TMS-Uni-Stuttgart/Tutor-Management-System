import {
  CircularProgress,
  createStyles,
  makeStyles,
  Paper,
  Theme,
  Typography,
  useTheme,
} from '@material-ui/core';
import React from 'react';
import Chart from 'react-google-charts';
import { TutorialSummaryInfo } from '../Dashboard';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    statsPaper: {
      margin: theme.spacing(1),
      padding: theme.spacing(2),
    },
    title: {
      textAlign: 'center',
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

interface ScheinPassedStatsCardProps {
  value: TutorialSummaryInfo;
}

function ScheinPassedStatsCard({ value }: ScheinPassedStatsCardProps): JSX.Element {
  const classes = useStyles();
  const theme = useTheme();

  const { backgroundColor, fontStyle } = theme.mixins.chart(theme);

  function getScheinPassedStats() {
    const heading = ['Status', 'Studenten'];
    let passedValue = 0;
    let notPassedValue = 0;
    const data: (string | number)[][] = [];

    Object.values(value.studentInfos).forEach((item) => {
      item.passed ? (passedValue += 1) : (notPassedValue += 1);
    });

    const passed = ['Bestanden', passedValue];
    const notPassed = ['Nicht bestanden', notPassedValue];

    data.push(heading, passed, notPassed);
    return data;
  }

  return (
    <Paper className={classes.statsPaper}>
      <Typography className={classes.title}>Aktueller Scheinstatus aller Studierenden</Typography>
      <Chart
        className={classes.chart}
        chartType='PieChart'
        loader={<CircularProgress className={classes.loader} />}
        data={getScheinPassedStats()}
        options={{
          backgroundColor,
          ...fontStyle,
          slices: {
            0: { color: theme.palette.green.dark },
            1: { color: theme.palette.red.dark },
          },
          legend: {
            ...fontStyle,
          },
        }}
      />
    </Paper>
  );
}

export default ScheinPassedStatsCard;
