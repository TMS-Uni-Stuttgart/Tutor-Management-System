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
import { ScheinCriteriaStatus } from 'shared/model/ScheinCriteria';
import { useTranslation } from '../../../util/lang/configI18N';
import { TutorialSummaryInfo } from '../Dashboard';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    statsPaper: {
      margin: theme.spacing(1),
      padding: theme.spacing(2),
    },
    placeholder: {
      marginTop: 64,
      textAlign: 'center',
    },
    chart: {
      width: '100%',
      height: '100%',
      margin: 'auto',
    },
    loader: {
      position: 'absolute',
      top: '50%',
      left: '50%',
    },
  })
);

interface ScheinCriteriaStatsCardProps {
  criteriaIds: string[];
  placeholder?: string;
  value: TutorialSummaryInfo;
}

function ScheinCriteriaStatsCard({
  value,
  criteriaIds,
  placeholder,
}: ScheinCriteriaStatsCardProps): JSX.Element {
  const classes = useStyles();
  const theme = useTheme();
  const { t } = useTranslation('scheincriteria');

  const { backgroundColor, colors, fontStyle } = theme.mixins.chart(theme);

  function filterSummaries(critId: string): ScheinCriteriaStatus[] {
    return Object.values(value.studentInfos)
      .filter((studentInfo) => Object.keys(studentInfo.scheinCriteriaSummary).includes(critId))
      .map((summary) => summary.scheinCriteriaSummary[critId]);
  }

  function summaryHasInfo(critId: string) {
    let hasInfo: boolean = false;

    filterSummaries(critId).forEach((status) => {
      if (Object.values(status.infos).length > 0) {
        hasInfo = true;
      } else {
        hasInfo = false;
      }
    });

    return hasInfo;
  }

  function getUnit(critId: string) {
    return filterSummaries(critId)[0].unit;
  }

  function getAdditionalStatusUnit(critId: string) {
    return Object.values(filterSummaries(critId)[0].infos)[0].unit;
  }

  function getName(critId: string) {
    return filterSummaries(critId)[0].name;
  }

  function getAdditionlaStatusTicks(critId: string) {
    const elements: number[] = [];
    filterSummaries(critId).forEach((item) => {
      Object.values(item.infos).forEach((info) => {
        if (!elements.includes(info.no)) {
          elements.push(info.no);
        }
      });
    });
    return elements;
  }

  function getStatusStats(critId: string) {
    const counts: { [totalValue: number]: number } = {};

    filterSummaries(critId).forEach((item) => {
      const achieved = item.achieved;
      const prevStudentCount = counts[achieved] || 0;

      counts[achieved] = prevStudentCount + 1;
    });

    const data: [string, number][] = Object.entries(counts);
    const headedData = [['Total', 'Studierende'], ...data];
    return headedData;
  }

  function getAdditionalStatusStats(critId: string) {
    const counts: [number, number][] = [];
    filterSummaries(critId).forEach((item) => {
      Object.values(item.infos).forEach((info) => {
        const element = info.no;
        const achieved = info.achieved;

        counts.push([element, achieved]);
      });
    });
    const headedData = [['Element', 'Punkte'], ...counts];
    return headedData;
  }

  return (
    <>
      {criteriaIds.length === 0 ? (
        <Paper className={classes.statsPaper}>
          <Typography variant='h6' className={classes.placeholder}>
            {placeholder}
          </Typography>
        </Paper>
      ) : (
        <>
          {criteriaIds.map((critId, idx) => {
            return (
              <Paper key={idx} className={classes.statsPaper}>
                {/* <AspectRatio ratio='16-9'> */}
                {summaryHasInfo(critId) ? (
                  <Chart
                    className={classes.chart}
                    chartType='ScatterChart'
                    loader={<CircularProgress className={classes.loader} />}
                    data={getAdditionalStatusStats(critId)}
                    options={{
                      backgroundColor,
                      ...fontStyle,
                      colors,
                      title: getName(critId),
                      hAxis: {
                        ...fontStyle,
                        title: `${t('UNIT_LABEL_' + getUnit(critId) + '_plural')}`,
                        ticks: getAdditionlaStatusTicks(critId),
                      },
                      vAxis: {
                        ...fontStyle,
                        title: `${t('UNIT_LABEL_' + getAdditionalStatusUnit(critId) + '_plural')}`,
                      },
                      legend: 'none',
                      dataOpacity: 0.6,
                    }}
                  />
                ) : (
                  <Chart
                    className={classes.chart}
                    chartType='ColumnChart'
                    loader={<CircularProgress className={classes.loader} />}
                    data={getStatusStats(critId)}
                    options={{
                      backgroundColor,
                      ...fontStyle,
                      colors,
                      title: getName(critId),
                      subtitle: 'based on hours studied',
                      hAxis: {
                        ...fontStyle,
                        title: `${t('UNIT_LABEL_' + getUnit(critId) + '_plural')}`,
                        minValue: 0,
                      },
                      vAxis: { ...fontStyle, title: 'Studierende' },
                      legend: 'none',
                    }}
                  />
                )}
                {/* </AspectRatio> */}
              </Paper>
            );
          })}
        </>
      )}
    </>
  );
}

export default ScheinCriteriaStatsCard;
