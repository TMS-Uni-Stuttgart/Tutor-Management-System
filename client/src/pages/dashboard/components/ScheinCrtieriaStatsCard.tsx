import { CircularProgress, Paper, Theme, Typography, useTheme } from '@mui/material';
import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';
import convert from 'color-convert';
import { useEffect, useState } from 'react';
import Chart from 'react-google-charts';
import { IScheinCriteria, ScheinCriteriaStatus } from 'shared/model/ScheinCriteria';
import { StudentStatus } from 'shared/model/Student';
import { getAllScheinCriterias } from '../../../hooks/fetching/Scheincriteria';
import { useSettings } from '../../../hooks/useSettings';
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
  const [criterias, setCriterias] = useState<IScheinCriteria[]>([]);
  const classes = useStyles();
  const theme = useTheme();
  const { t } = useTranslation('scheincriteria');
  const { settings } = useSettings();
  const numberOfStudents = Object.keys(value.studentInfos).length;

  const { backgroundColor, colors, fontStyle } = theme.mixins.chart(theme);

  useEffect(() => {
    getAllScheinCriterias().then((res) => setCriterias(res));
  }, []);

  function filterSummaries(critId: string): ScheinCriteriaStatus[] {
    return Object.values(value.studentInfos)
      .filter(
        (studentInfo) =>
          !settings.excludeStudentsByStatus ||
          ![StudentStatus.NO_SCHEIN_REQUIRED, StudentStatus.INACTIVE].includes(
            studentInfo.student.status
          )
      )
      .filter((studentInfo) => Object.keys(studentInfo.scheinCriteriaSummary).includes(critId))
      .map((summary) => summary.scheinCriteriaSummary[critId]);
  }

  function summaryHasInfo(critId: string) {
    let hasInfo: boolean = false;

    filterSummaries(critId).forEach((status) => {
      hasInfo = Object.values(status.infos).length > 0;
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

  function getAdditionalStatusTicks(critId: string) {
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
    return [['Total', 'Studierende'], ...data];
  }

  function generateColors(count: number): string[] {
    const colors: string[] = [];
    const hueStep = Math.floor(360 / count);

    for (let i = 0; i < count; i++) {
      const hue = (i * hueStep) % 360;
      const rgb = convert.hsl.rgb([hue, 70, 50]);
      colors.push(`rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`);
    }

    return colors;
  }

  function filterAndSortSummaries(critId: string): ScheinCriteriaStatus[] {
    return Object.values(value.studentInfos)
      .filter(
        (studentInfo) =>
          !settings.excludeStudentsByStatus ||
          ![StudentStatus.NO_SCHEIN_REQUIRED, StudentStatus.INACTIVE].includes(
            studentInfo.student.status
          )
      )
      .filter((studentInfo) => Object.keys(studentInfo.scheinCriteriaSummary).includes(critId))
      .sort((a, b) => {
        const teamIdA = a.student.team?.id || '';
        const teamIdB = b.student.team?.id || '';

        if (teamIdA === teamIdB) return 0;
        return teamIdA < teamIdB ? -1 : 1;
      })
      .map((studentInfo) => studentInfo.scheinCriteriaSummary[critId]);
  }

  function getAdditionalStatusStats(critId: string) {
    const counts: (string | number)[][] = [];

    const criteria = criterias.find((criteria) => criteria.id === critId);
    let threshold: any = 0;
    let isSheetTotal = false;
    if (criteria?.data['valuePerSheetNeeded']) {
      threshold = criteria.data['valuePerSheetNeeded'];
    } else if (criteria?.data['valuePerTestNeeded']) {
      threshold = criteria?.data['valuePerTestNeeded'];
    } else {
      threshold = criteria?.data['valueNeeded'];
      isSheetTotal = true;
    }

    const colorPalette = generateColors(numberOfStudents);
    let colorIndex = 0;

    filterAndSortSummaries(critId).forEach((item) => {
      Object.values(item.infos).forEach((info) => {
        const element = info.no;
        const achieved = info.achieved;
        let required: number = 0;

        if (isSheetTotal) {
          required =
            threshold > 1
              ? info.total * (threshold / Object.keys(item.infos).length)
              : info.total * threshold;
        } else {
          required = threshold <= 1 ? info.total * threshold : Number(threshold);
        }

        const color = colorPalette[colorIndex % colorPalette.length];

        counts.push([element, achieved, color, required]);
      });
      colorIndex++;
    });

    return [['Element', 'Punkte', { role: 'style' }, 'Threshold'], ...counts];
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
                        ticks: getAdditionalStatusTicks(critId),
                      },
                      vAxis: {
                        ...fontStyle,
                        title: `${t('UNIT_LABEL_' + getAdditionalStatusUnit(critId) + '_plural')}`,
                      },
                      legend: 'none',
                      series: {
                        0: { pointShape: 'circle', pointSize: 3 },
                        1: { pointShape: 'diamond', pointSize: 10 },
                      },
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
