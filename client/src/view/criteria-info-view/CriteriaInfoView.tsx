import { Box } from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import React from 'react';
import BackButton from '../../components/back-button/BackButton';
import { ROUTES } from '../../routes/Routing.routes';

const useStyles = makeStyles((theme) =>
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
  // const theme = useTheme();

  // const { id: criteriaId } = useParams<PathParams>();
  // const { setError } = useErrorSnackbar();

  // const { t } = useTranslation(i18nNamespace.SCHEINCRITERIA);

  // const [students, setStudents] = useState<Student[]>();
  // const [criteriaInfo, setCriteriaInfo] = useState<CriteriaInformation>();
  // const [information, setInformation] = useState<CriteriaInformationItem>();
  // const [selectedSheetOrExam, setSelectetSheetOrExam] = useState<HasExercises>();

  // useEffect(() => {
  //   getAllStudents()
  //     .then(response => {
  //       setStudents(response);
  //     })
  //     .catch(() => {
  //       setError('Studierende konnten nicht abgerufen werden.');
  //       setStudents(undefined);
  //     });
  // }, [setError]);

  // useEffect(() => {
  //   getScheincriteriaInformation(criteriaId)
  //     .then(response => {
  //       setCriteriaInfo(response);
  //     })
  //     .catch(() => {
  //       setError('Informationen über das Kriterium konnten nicht abgerufen werden.');
  //     });
  // }, [criteriaId, setError]);

  // useEffect(() => {
  //   setInformation(
  //     selectedSheetOrExam ? criteriaInfo?.information[selectedSheetOrExam.id] : undefined
  //   );
  // }, [criteriaInfo, selectedSheetOrExam]);

  // const handleSheetOrExamChange: OnChangeHandler = event => {
  //   if (!criteriaInfo?.sheetsOrExams) {
  //     return;
  //   }

  //   const exam = criteriaInfo.sheetsOrExams.find(exam => exam.id === event.target.value);

  //   setSelectetSheetOrExam(exam);
  // };

  return (
    <Box display='flex' flexDirection='column'>
      <Box display='flex' marginBottom={3}>
        <BackButton to={ROUTES.MANAGE_SCHEIN_CRITERIAS.create({})} className={classes.backButton} />

        {/* {criteriaInfo && <Typography variant='h4'>{criteriaInfo.name}</Typography>} */}
      </Box>

      <Box>WORK IN PROGRESS</Box>
      {/* <Placeholder
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
                            const hasAttended =
                              student.getGrading(selectedSheetOrExam) !== undefined;

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
                                        grading={student.getGrading(selectedSheetOrExam)}
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
      </Placeholder> */}
    </Box>
  );
}

export default CriteriaInfoView;
