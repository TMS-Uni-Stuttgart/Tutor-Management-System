import {
  Box,
  Chip,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Typography,
} from '@material-ui/core';
import { createStyles, makeStyles, useTheme } from '@material-ui/core/styles';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';
import { CriteriaInformation, CriteriaInformationItem } from 'shared/model/ScheinCriteria';
import { HasExercises } from 'shared/model/Sheet';
import { Student } from 'shared/model/Student';
import { getNameOfEntity } from 'shared/util/helpers';
import BackButton from '../../components/BackButton';
import CustomSelect, { OnChangeHandler } from '../../components/CustomSelect';
import ChartPaper from '../../components/info-paper/ChartPaper';
import InfoPaper from '../../components/info-paper/InfoPaper';
import PaperTableRow from '../../components/PaperTableRow';
import Placeholder from '../../components/Placeholder';
import PointsTable from '../../components/points-table/PointsTable';
import StudentAvatar from '../../components/student-icon/StudentAvatar';
import TableWithPadding from '../../components/TableWithPadding';
import { getScheincriteriaInformation } from '../../hooks/fetching/Scheincriteria';
import { getAllStudents } from '../../hooks/fetching/Student';
import { useErrorSnackbar } from '../../hooks/useErrorSnackbar';
import { RoutingPath } from '../../routes/Routing.routes';
import { i18nNamespace } from '../../util/lang/configI18N';

const useStyles = makeStyles(theme =>
  createStyles({
    backButton: {
      marginRight: theme.spacing(2),
      alignSelf: 'center',
    },
    graphGrid: {
      marginTop: theme.spacing(1.5),
      marginBottom: theme.spacing(2),
    },
    studentRow: {
      marginBottom: theme.spacing(2),
    },
  })
);

interface PathParams {
  id: string;
}

function CriteriaInfoView(): JSX.Element {
  const classes = useStyles();
  const theme = useTheme();

  const { id: criteriaId } = useParams<PathParams>();
  const { setError } = useErrorSnackbar();

  const { t } = useTranslation(i18nNamespace.SCHEINCRITERIA);

  const [students, setStudents] = useState<Student[]>();
  const [criteriaInfo, setCriteriaInfo] = useState<CriteriaInformation>();
  const [information, setInformation] = useState<CriteriaInformationItem>();
  const [selectedSheetOrExam, setSelectetSheetOrExam] = useState<HasExercises>();

  useEffect(() => {
    getAllStudents()
      .then(response => {
        setStudents(response);
      })
      .catch(() => {
        setError('Studierende konnten nicht abgerufen werden.');
        setStudents(undefined);
      });
  }, [setError]);

  useEffect(() => {
    getScheincriteriaInformation(criteriaId)
      .then(response => {
        setCriteriaInfo(response);
      })
      .catch(() => {
        setError('Informationen über das Kriterium konnten nicht abgerufen werden.');
      });
  }, [criteriaId, setError]);

  useEffect(() => {
    setInformation(
      selectedSheetOrExam ? criteriaInfo?.information[selectedSheetOrExam.id] : undefined
    );
  }, [criteriaInfo, selectedSheetOrExam]);

  const handleSheetOrExamChange: OnChangeHandler = event => {
    if (!criteriaInfo?.sheetsOrExams) {
      return;
    }

    const exam = criteriaInfo.sheetsOrExams.find(exam => exam.id === event.target.value);

    setSelectetSheetOrExam(exam);
  };

  return (
    <Box display='flex' flexDirection='column'>
      <Box display='flex' marginBottom={3}>
        <BackButton to={RoutingPath.MANAGE_SCHEIN_CRITERIAS} className={classes.backButton} />

        {criteriaInfo && <Typography variant='h4'>{criteriaInfo.name}</Typography>}
      </Box>

      <Placeholder
        placeholderText='Keine Informationen verfügbar.'
        showPlaceholder={!criteriaInfo?.sheetsOrExams}
        loading={!criteriaInfo}
      >
        {criteriaInfo && criteriaInfo.sheetsOrExams && (
          <Box display='flex' flexDirection='column' marginBottom={1}>
            <CustomSelect
              label='Übungsblatt oder Klausur wählen'
              emptyPlaceholder='Keine Blätter oder Klausuren vorhanden.'
              items={criteriaInfo.sheetsOrExams}
              itemToString={item => `Scheinklausur #${item.no}`}
              itemToValue={item => item.id}
              onChange={handleSheetOrExamChange}
              value={selectedSheetOrExam?.id ?? ''}
            />

            <Placeholder
              placeholderText='Keine Klausur oder kein Übungsblatt gewählt.'
              showPlaceholder={!selectedSheetOrExam}
            >
              {!!selectedSheetOrExam && !!information && (
                <>
                  <Grid container spacing={2} className={classes.graphGrid}>
                    <Grid item sm={12} md={6} lg={6}>
                      <ChartPaper
                        title='Bestehensquote'
                        chartType='PieChart'
                        data={[
                          ['Status', 'Anzahl'],
                          ...Object.entries(information.achieved).map(([key, value]) => [
                            t(`ACHIEVED_PIE_CHART_LABEL_${key}`),
                            value,
                          ]),
                        ]}
                        options={{
                          slices: {
                            0: { color: theme.palette.green.dark },
                            1: { color: theme.palette.red.dark },
                            2: { color: theme.palette.orange.dark },
                          },
                          legend: {
                            position: 'labeled',
                          },
                          pieSliceText: 'value',
                        }}
                      />
                    </Grid>

                    {information.distribution && (
                      <Grid item sm={12} md={6} lg={6}>
                        <ChartPaper
                          title='Punkteverteilung'
                          chartType='ColumnChart'
                          data={[
                            ['Punkte', 'Anzahl', { role: 'style' }, { role: 'annotation' }],
                            ...Object.entries(information.distribution)
                              .sort((a, b) => Number.parseInt(a[0]) - Number.parseInt(b[0]))
                              .map(([key, info]) => [
                                key,
                                info.value,
                                info.aboveThreshhold
                                  ? theme.palette.green.dark
                                  : theme.palette.red.dark,
                                info.value,
                              ]),
                          ]}
                          options={{
                            slices: {
                              0: { color: theme.palette.green.dark },
                              1: { color: theme.palette.red.dark },
                              2: { color: theme.palette.orange.dark },
                            },
                            legend: {
                              position: 'none',
                            },
                          }}
                        />
                      </Grid>
                    )}

                    {information.averages && (
                      <Grid item sm={12} md={6} lg={6}>
                        <InfoPaper title='Durchschnitt'>
                          <Table>
                            <TableBody>
                              {Object.entries(information.averages).map(([identifier, info]) => (
                                <TableRow key={identifier} hover>
                                  <TableCell>{identifier}</TableCell>
                                  <TableCell align='center'>{`${Math.round(info.value * 100) /
                                    100} / ${info.total}`}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </InfoPaper>
                      </Grid>
                    )}
                  </Grid>

                  <Placeholder
                    placeholderText='Keine Studierenden verfügbar.'
                    showPlaceholder={!!students && students.length === 0}
                    loading={!students}
                  >
                    <Box display='flex' flexDirection='column'>
                      {!!students && !!selectedSheetOrExam && (
                        <TableWithPadding
                          items={students}
                          createRowFromItem={student => {
                            const hasPassed = criteriaInfo.studentSummaries[student.id].passed;
                            const hasAttended = new PointMap(student.scheinExamResults).has(
                              selectedSheetOrExam.id
                            );

                            return (
                              <PaperTableRow
                                key={student.id}
                                label={getNameOfEntity(student)}
                                subText={student.matriculationNo || 'Keine Matrikelnummer'}
                                Avatar={<StudentAvatar student={student} />}
                                className={classes.studentRow}
                              >
                                <TableCell>
                                  <Box display='flex' alignItems='center' justifyContent='flex-end'>
                                    <Box marginRight={4}>
                                      {hasAttended ? (
                                        <Chip
                                          label={hasPassed ? 'Bestanden' : 'Nicht bestanden'}
                                          style={{
                                            background: hasPassed
                                              ? theme.palette.green.dark
                                              : theme.palette.red.dark,
                                          }}
                                        />
                                      ) : (
                                        <Chip
                                          label='Nicht mitgeschrieben'
                                          style={{ background: theme.palette.orange.dark }}
                                        />
                                      )}
                                    </Box>

                                    <Box>
                                      <PointsTable
                                        points={new PointMap(student.scheinExamResults)}
                                        sheet={selectedSheetOrExam}
                                      />
                                    </Box>
                                  </Box>
                                </TableCell>
                              </PaperTableRow>
                            );
                          }}
                        />
                      )}
                    </Box>
                  </Placeholder>
                </>
              )}
            </Placeholder>
          </Box>
        )}
      </Placeholder>
    </Box>
  );
}

export default CriteriaInfoView;
