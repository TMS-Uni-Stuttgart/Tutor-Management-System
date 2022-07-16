import { CircularProgress, PaperProps } from '@material-ui/core';
import { createStyles, makeStyles, useTheme } from '@material-ui/core/styles';
import React from 'react';
import Chart from 'react-google-charts';
import InfoPaper from './InfoPaper';

// Do NOT import the props directly from the react-google-charts/dist/types folder because snowpack cannot load this as dependency.
type ReactGoogleChartProps = React.ComponentProps<typeof Chart>;

const useStyles = makeStyles((theme) =>
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

interface Props extends ReactGoogleChartProps {
  title: string;
  PaperProps?: PaperProps;
}

function ChartPaper({ PaperProps, title, ...chartProps }: Props): JSX.Element {
  const classes = useStyles();
  const theme = useTheme();
  const { fontStyle } = theme.mixins.chart(theme);

  return (
    <InfoPaper title={title} {...PaperProps}>
      <Chart
        {...chartProps}
        options={{
          backgroundColor: 'transparent',
          ...fontStyle,
          ...chartProps.options,
          legend: {
            ...fontStyle,
            ...chartProps.options?.legend,
          },
          hAxis: {
            ...fontStyle,
            ...chartProps.options?.hAxis,
            baselineColor: theme.palette.text.primary,
          },
          vAxis: {
            ...fontStyle,
            ...chartProps.options?.vAxis,
            baselineColor: theme.palette.text.primary,
          },
        }}
        className={classes.chart}
        loader={<CircularProgress className={classes.loader} />}
      />
    </InfoPaper>
  );
}

export default ChartPaper;
