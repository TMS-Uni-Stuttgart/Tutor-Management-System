import {
  CircularProgress,
  createStyles,
  makeStyles,
  Paper,
  Theme,
  useTheme,
  Typography,
} from '@material-ui/core';
import GREEN from '@material-ui/core/colors/green';
import RED from '@material-ui/core/colors/red';
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

  function getScheinPassedStats() {
    const heading = ['Status', 'Studenten'];
    let passedValue = 0;
    let notPassedValue = 0;
    const data: (string | number)[][] = [];

    Object.values(value.studentInfos).forEach(item => {
      item.passed ? (passedValue += 1) : (notPassedValue += 1);
    });

    const passed = ['Bestanden', passedValue];
    const notPassed = ['Nicht bestanden', notPassedValue];

    data.push(heading, passed, notPassed);
    return data;
  }

  return (
    <Paper className={classes.statsPaper}>
      {/* <AspectRatio ratio='16-9'> */}
      <Typography className={classes.title}>Aktueller Scheinstatus aller Studierende</Typography>
      <Chart
        className={classes.chart}
        chartType='PieChart'
        loader={<CircularProgress className={classes.loader} />}
        data={getScheinPassedStats()}
        options={{
          fontName: theme.typography.fontFamily,
          fontSize: theme.typography.fontSize,
          //title: 'Aktueller Scheinstatus aller Studierende',
          slices: {
            0: { color: GREEN[600] },
            1: { color: RED[600] },
          },
        }}
      />
      {/* </AspectRatio> */}
    </Paper>
  );
}

export default ScheinPassedStatsCard;
