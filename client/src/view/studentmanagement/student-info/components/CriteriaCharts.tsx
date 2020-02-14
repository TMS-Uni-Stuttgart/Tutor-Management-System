import { Grid, GridProps } from '@material-ui/core';
import { useTheme } from '@material-ui/core/styles';
import React from 'react';
import { ScheinCriteriaSummary } from 'shared/model/ScheinCriteria';
import ChartPaper from '../../../../components/info-paper/ChartPaper';

interface Props extends GridProps {
  firstCard?: React.ReactNode;
  scheinStatus: ScheinCriteriaSummary;
}

function CriteriaCharts({ scheinStatus, firstCard, ...props }: Props): JSX.Element {
  const theme = useTheme();

  return (
    <Grid container spacing={2} {...props}>
      {firstCard && (
        <Grid item sm={12} md={6} lg={4}>
          {firstCard}
        </Grid>
      )}

      {Object.values(scheinStatus.scheinCriteriaSummary).map(summary => (
        <Grid item key={summary.id} sm={12} md={6} lg={4}>
          <ChartPaper
            title={summary.name}
            chartType='PieChart'
            data={[
              ['Status', 'Anzahl'],
              ['Erfüllt', summary.achieved],
              ['Nicht erfüllt', summary.total - summary.achieved],
            ]}
            options={{
              slices: {
                0: { color: theme.palette.green.dark },
                1: { color: theme.palette.red.dark },
              },
              legend: {
                position: 'labeled',
              },
              pieSliceText: 'value',
            }}
          />
        </Grid>
      ))}
    </Grid>
  );
}

export default CriteriaCharts;
