import { createStyles, Tab, Tabs, Theme, Typography } from '@material-ui/core';
import { People as TeamIcon } from '@material-ui/icons';
import { makeStyles } from '@material-ui/styles';
import { withSnackbar, WithSnackbarProps } from 'notistack';
import React, { ChangeEvent, useEffect, useState } from 'react';
import { RouteComponentProps, withRouter } from 'react-router';
import { PointMap, PointMapEntry, UpdatePointsDTO } from 'shared/dist/model/Points';
import { Sheet } from 'shared/dist/model/Sheet';
import { PresentationPointsDTO, Student } from 'shared/dist/model/Student';
import { Team } from 'shared/dist/model/Team';
import CustomSelect from '../../components/CustomSelect';
import SubmitButton from '../../components/forms/components/SubmitButton';
import TableWithPadding from '../../components/TableWithPadding';
import { useDialog } from '../../hooks/DialogService';
import { useAxios } from '../../hooks/FetchingService';
import { saveBlob } from '../../util/helperFunctions';
import EditStudentPointsDialogContent, {
  EditStudentPointsCallback,
} from './components/EditStudentPointsDialogContent';
import PointsCard, {
  convertPointsCardExerciseToPointMapEntry,
  convertPointsCardFormStateToDTO,
  PointsSaveCallback,
} from './components/points-card/PointsCard';
import StudentPresentationRow, {
  StudentPresentationPointsCallback,
} from './components/StudentPresentationRow';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
      flexDirection: 'column',
    },
    sheetSelect: {
      marginBottom: theme.spacing(2),
    },
    buttonBox: {
      display: 'flex',
      justifyContent: 'flex-start',
      marginTop: theme.spacing(2),
    },
    button: {
      marginRight: theme.spacing(1),
      '&:last-of-type': {
        marginRight: 0,
      },
    },
    placeholder: {
      marginTop: theme.spacing(8),
      textAlign: 'center',
    },
    pointCard: {
      marginTop: theme.spacing(2),
    },
  })
);

enum TabValue {
  POINTS = 'POINTS',
  PRESENTATION = 'PRESENTATION',
}

interface Params {
  tutorialId: string;
}

type Props = WithSnackbarProps & RouteComponentProps<Params>;

function PointManagement({ match, enqueueSnackbar }: Props): JSX.Element {
  const classes = useStyles();
  const dialog = useDialog();
  const {
    getAllSheets,
    getTeamsOfTutorial,
    getStudentsOfTutorial,
    setPointsOfTeam,
    setPointsOfStudent,
    setPresentationPointsOfStudent,
    getStudent,
    getTeamOfTutorial,
    getSingleCorrectionCommentPDF,
    getCorrectionCommentPDFs,
  } = useAxios();

  const [sheets, setSheets] = useState<Sheet[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [students, setStudents] = useState<Student[]>([]);

  const [currentSheet, setCurrentSheet] = useState<Sheet | undefined>(undefined);
  const [selectedTab, setSelectedTab] = useState<TabValue>(TabValue.POINTS);

  const [isGeneratingPDFs, setGeneratingPDFs] = useState(false);

  const { tutorialId } = match.params;

  useEffect(() => {
    Promise.all([getAllSheets(), getTeamsOfTutorial(tutorialId), getStudentsOfTutorial(tutorialId)])
      .then(([sheetResponse, teamResponse, studentResponse]) => {
        setSheets(sheetResponse);
        setTeams(teamResponse);
        setStudents(studentResponse);
      })
      .catch(reason => console.error(reason));
  }, [getAllSheets, getTeamsOfTutorial, getStudentsOfTutorial, tutorialId]);

  function onSheetSelection(e: ChangeEvent<{ name?: string; value: unknown }>) {
    if (typeof e.target.value !== 'string') {
      return;
    }

    const sheet: Sheet | undefined = sheets.find(s => s.id === e.target.value);
    setCurrentSheet(sheet);
  }

  const handleSavePoints: (team: Team) => PointsSaveCallback = team => async (
    values,
    { setSubmitting, resetForm }
  ) => {
    if (!currentSheet) {
      return;
    }

    const pointsDTO = convertPointsCardFormStateToDTO(values, currentSheet);

    try {
      await setPointsOfTeam(tutorialId, team.id, pointsDTO);

      const updatedTeam = await getTeamOfTutorial(tutorialId, team.id);

      setTeams(teams.map(t => (t.id === team.id ? updatedTeam : t)));

      resetForm({
        values: {
          ...values,
        },
      });
      enqueueSnackbar(
        `Punkte für Team #${team.teamNo.toString().padStart(2, '0')} erfolgreich eingetragen.`,
        { variant: 'success' }
      );
    } catch (reason) {
      console.error(reason);
      enqueueSnackbar(
        `Punkte für Team #${team.teamNo.toString().padStart(2, '0')} eintragen fehlgeschlagen.`,
        { variant: 'error' }
      );
    } finally {
      setSubmitting(false);
    }
  };

  const savePointsOfStudents: EditStudentPointsCallback = async values => {
    if (!currentSheet) {
      return;
    }

    const promises: Promise<void>[] = [];

    Object.entries(values).forEach(([studentId, formState]) => {
      const student = students.find(s => s.id === studentId);

      if (!student) {
        return;
      }

      const changedExercises: PointMap = new PointMap();
      const pointsOfStudent = new PointMap(student.points);

      Object.entries(formState).forEach(([exIdentifier, exercise]) => {
        const exerciseEntry: PointMapEntry = convertPointsCardExerciseToPointMapEntry(exercise);
        const prevEntry = pointsOfStudent.getPointEntry(exIdentifier);

        if (!prevEntry || !PointMap.arePointMapEntriesEqual(prevEntry, exerciseEntry)) {
          changedExercises.setPointsByKey(exIdentifier, exerciseEntry);
        }
      });

      const pointsDTO: UpdatePointsDTO = {
        id: currentSheet.id,
        exercises: changedExercises.toDTO(),
      };

      promises.push(setPointsOfStudent(studentId, pointsDTO));
    });

    await Promise.all(promises);

    const updatedStudentPromises: Promise<Student>[] = [];
    const fetchedTeamIds: string[] = [];
    const updatedTeamPromises: Promise<Team>[] = [];

    Object.keys(values).forEach(studentId => {
      const student = students.find(s => s.id === studentId);

      if (student) {
        const teamId = student.team;

        if (teamId && !fetchedTeamIds.includes(teamId)) {
          fetchedTeamIds.push(teamId);
          updatedTeamPromises.push(getTeamOfTutorial(tutorialId, teamId));
        }
      }

      updatedStudentPromises.push(getStudent(studentId));
    });

    const updatedStudents: Student[] = await Promise.all(updatedStudentPromises);
    const updatedTeams: Team[] = await Promise.all(updatedTeamPromises);

    setStudents(
      students.map(s => {
        const idx = updatedStudents.findIndex(val => val.id === s.id);

        return idx > -1 ? updatedStudents[idx] : s;
      })
    );

    setTeams(
      teams.map(t => {
        const idx = updatedTeams.findIndex(val => val.id === t.id);

        return idx > -1 ? updatedTeams[idx] : t;
      })
    );

    enqueueSnackbar('Punkte der Studierenden wurden erfolgreich gespeichert.', {
      variant: 'success',
    });
    dialog.hide();
  };

  const handleEditPointsOfStudents = (team: Team) => () => {
    if (!currentSheet) {
      return;
    }

    dialog.show({
      title: 'Punkte für Studierende bearbeiten',
      content: (
        <EditStudentPointsDialogContent
          team={team}
          sheet={currentSheet}
          onSaveClicked={savePointsOfStudents}
          onCancelClicked={dialog.hide}
        />
      ),
      DialogProps: {
        maxWidth: 'xl',
      },
    });
  };

  const savePresentationPointsOfStudent: (
    student: Student
  ) => StudentPresentationPointsCallback = student => async (
    { presentations },
    { setSubmitting, resetForm }
  ) => {
    if (!currentSheet) {
      return;
    }

    const dto: PresentationPointsDTO = {
      sheetId: currentSheet.id,
      points: presentations,
    };

    try {
      await setPresentationPointsOfStudent(student.id, dto);

      setStudents(
        students.map(s => {
          if (s.id === student.id) {
            const { presentationPoints } = s;

            return {
              ...s,
              presentationPoints: {
                ...presentationPoints,
                [currentSheet.id]: dto.points,
              },
            };
          }

          return s;
        })
      );

      resetForm({
        values: {
          presentations: dto.points,
        },
      });
      enqueueSnackbar(
        `Präsentationen für ${student.firstname} ${student.lastname} wurden erfolgreich gespeichert.`,
        { variant: 'success' }
      );
    } catch (reason) {
      console.error(reason);
      enqueueSnackbar(
        `Präsentationen für ${student.firstname} ${student.lastname} konnten nicht gespeichert werden.`,
        { variant: 'error' }
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleGenerateSinglePdf = (team: Team) => async () => {
    if (!currentSheet) {
      return;
    }

    setGeneratingPDFs(true);

    try {
      const blob = await getSingleCorrectionCommentPDF(tutorialId, currentSheet.id, team.id);
      const teamName = team.students.map(s => s.lastname).join('');

      saveBlob(blob, `Bewertung_${currentSheet.sheetNo.toString().padStart(2, '0')}_${teamName}`);
    } catch {
      enqueueSnackbar('PDFs konnten nicht erstellt werden.', { variant: 'error' });
    }

    setGeneratingPDFs(false);
  };

  const handleGeneratingAllPDFs = async () => {
    if (!currentSheet) {
      return;
    }

    setGeneratingPDFs(true);

    try {
      const blob = await getCorrectionCommentPDFs(tutorialId, currentSheet.id);

      saveBlob(blob, `Bewertungen_${currentSheet.sheetNo.toString().padStart(2, '0')}`);
    } catch {
      enqueueSnackbar('PDFs konnten nicht erstellt werden.', { variant: 'error' });
    }

    setGeneratingPDFs(false);
  };

  return (
    <div className={classes.root}>
      <CustomSelect
        label='Blatt wählen'
        emptyPlaceholder='Keine Bätter vorhanden.'
        className={classes.sheetSelect}
        items={sheets}
        itemToString={sheet => `Übungsblatt #${sheet.sheetNo.toString().padStart(2, '0')}`}
        itemToValue={sheet => sheet.id}
        value={currentSheet ? currentSheet.id : ''}
        onChange={onSheetSelection}
      />

      {currentSheet ? (
        <>
          <Tabs value={selectedTab} onChange={(_, value) => setSelectedTab(value)}>
            <Tab value={TabValue.POINTS} label='Punkte' />
            <Tab value={TabValue.PRESENTATION} label='Präsentationen' />
          </Tabs>

          <div className={classes.buttonBox}>
            {selectedTab === TabValue.POINTS && (
              <SubmitButton
                isSubmitting={isGeneratingPDFs}
                variant='outlined'
                className={classes.button}
                onClick={handleGeneratingAllPDFs}
                disabled={!currentSheet}
                modalText='Erstelle PDFs...'
              >
                PDFs erstellen
              </SubmitButton>
            )}
            {/* <Button variant='outlined'>Alle speichern</Button> */}
          </div>

          {
            {
              [TabValue.POINTS]:
                teams.length > 0 ? (
                  teams.map(team => (
                    <PointsCard
                      key={team.id}
                      className={classes.pointCard}
                      avatar={<TeamIcon />}
                      title={`Team #${team.teamNo.toString().padStart(2, '0')}`}
                      subtitle={`${team.students.map(s => s.lastname).join(', ')}`}
                      entity={{ id: team.id, points: new PointMap(team.points) }}
                      entityWithExercises={currentSheet}
                      onPointsSave={handleSavePoints(team)}
                      onEditPoints={handleEditPointsOfStudents(team)}
                      onGeneratePdf={handleGenerateSinglePdf(team)}
                    />
                  ))
                ) : (
                  <Typography variant='h6' className={classes.placeholder}>
                    Keine Teams verfügbar.
                  </Typography>
                ),
              [TabValue.PRESENTATION]: (
                <TableWithPadding
                  key={currentSheet.id}
                  items={students}
                  createRowFromItem={student => (
                    <StudentPresentationRow
                      key={student.id}
                      student={student}
                      sheet={currentSheet}
                      onPointsSave={savePresentationPointsOfStudent(student)}
                    />
                  )}
                  placeholder='Keine Studierende verfügbar.'
                />
              ),
            }[selectedTab]
          }
        </>
      ) : (
        <Typography className={classes.placeholder} variant='h6'>
          Kein Blatt ausgewählt.
        </Typography>
      )}
    </div>
  );
}

export default withRouter(withSnackbar(PointManagement));
