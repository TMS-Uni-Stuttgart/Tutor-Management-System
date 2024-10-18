import { Grid, GridProps } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import React from 'react';
import { ScheinCriteriaSummary } from 'shared/model/ScheinCriteria';
import ChartPaper from '../../../components/info-paper/ChartPaper';
import { ChartWrapperOptions } from 'react-google-charts/dist/types';

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
        const data: [string, number][] = [];
        let options: ChartWrapperOptions['options'];

        switch (summary.chartType) {
          case 'PieChart':
            data.push(['Erfüllt', achieved], ['Nicht erfüllt', notAchieved]);
            options = {
              slices: {
                0: { color: theme.palette.green.dark },
                1: { color: theme.palette.red.dark },
              },
              legend: { position: 'labeled' },
              pieSliceText: 'value',
            };
            break;

          case 'ColumnChart':
            data.push(['Erfüllt', achieved]);
            options = { vAxis: { minValue: 0 }, legend: { position: 'none' } };
            break;

          default:
            data.push(['Erfüllt', achieved], ['Nicht erfüllt', notAchieved]);
            options = {};
        }

        console.log(options);

        return (
          <Grid {...props} item key={summary.id}>
            <ChartPaper
              title={summary.name}
              chartType={summary.chartType}
              data={[['Status', 'Anzahl'], ...data]}
              options={options}
            />
          </Grid>
        );
      })}
    </>
  );
}

export default CriteriaCharts;
