import React from 'react';
import { makeStyles, createStyles, useTheme } from '@material-ui/core/styles';
import { Grid, Paper, Typography, CircularProgress, GridProps } from '@material-ui/core';
import Chart from 'react-google-charts';
import { ScheinCriteriaSummary } from 'shared/dist/model/ScheinCriteria';

const useStyles = makeStyles(theme =>
  createStyles({
    summaryPaper: {
      flex: 1,
      background: theme.palette.background.default,
      padding: theme.spacing(1.5),
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

interface Props extends GridProps {
  scheinStatus: ScheinCriteriaSummary;
}

function CriteriaCharts({ scheinStatus, ...props }: Props): JSX.Element {
  const classes = useStyles();
  const theme = useTheme();
  const { fontStyle } = theme.mixins.chart(theme);

  return (
    <Grid container spacing={2} {...props}>
      {Object.values(scheinStatus.scheinCriteriaSummary).map(summary => (
        <Grid item key={summary.id} sm={12} md={6} lg={4}>
          <Paper key={summary.id} variant='outlined' className={classes.summaryPaper}>
            <Typography className={classes.title}>{summary.name}</Typography>

            <Chart
              className={classes.chart}
              chartType='PieChart'
              loader={<CircularProgress className={classes.loader} />}
              data={[
                ['Status', 'Anzahl'],
                ['Erfüllt', summary.achieved],
                ['Nicht erfüllt', summary.total - summary.achieved],
              ]}
              options={{
                backgroundColor: 'transparent',
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
        </Grid>
      ))}
    </Grid>
  );
}

export default CriteriaCharts;
