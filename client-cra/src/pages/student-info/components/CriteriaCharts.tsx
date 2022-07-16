import { Grid, GridProps } from '@material-ui/core';
import { useTheme } from '@material-ui/core/styles';
import React from 'react';
import { ScheinCriteriaSummary } from 'shared/model/ScheinCriteria';
import ChartPaper from '../../../components/info-paper/ChartPaper';

interface Props extends GridProps {
  scheinStatus: ScheinCriteriaSummary;
}

function CriteriaCharts({ scheinStatus, ...props }: Props): JSX.Element {
  const theme = useTheme();

  return (
    <>
      {Object.values(scheinStatus.scheinCriteriaSummary).map((summary) => {
        const achieved = summary.achieved;
        const notAchieved =
          summary.total >= summary.achieved ? summary.total - summary.achieved : 0;

        return (
          <Grid {...props} item key={summary.id}>
            <ChartPaper
              title={summary.name}
              chartType='PieChart'
              data={[
                ['Status', 'Anzahl'],
                ['Erfüllt', achieved],
                ['Nicht erfüllt', notAchieved],
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
        );
      })}
    </>
  );
}

export default CriteriaCharts;
