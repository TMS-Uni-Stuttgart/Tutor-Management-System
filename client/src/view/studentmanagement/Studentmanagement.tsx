import { Theme } from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/styles';
import { withSnackbar, WithSnackbarProps } from 'notistack';
import React, { useEffect, useState } from 'react';
import { RouteComponentProps, withRouter } from 'react-router';
import { ScheinCriteriaSummary } from 'shared/dist/model/ScheinCriteria';
import { StudentDTO } from 'shared/dist/model/Student';
import { Team } from 'shared/dist/model/Team';
import { getNameOfEntity, sortByName } from 'shared/dist/util/helpers';
import StudentForm, {
  CREATE_NEW_TEAM_VALUE,
  StudentFormSubmitCallback,
  getInitialStudentFormState,
} from '../../components/forms/StudentForm';
import LoadingSpinner from '../../components/LoadingSpinner';
import TableWithForm from '../../components/TableWithForm';
import { useDialog } from '../../hooks/DialogService';
import { useAxios } from '../../hooks/FetchingService';
import { StudentWithFetchedTeam } from '../../typings/types';
import ExtendableStudentRow from '../management/components/ExtendableStudentRow';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
      flexDirection: 'column',
      maxHeight: '100%',
      position: 'relative',
    },
    dialogDeleteButton: {
      color: theme.palette.error.main,
    },
    printButton: {
      marginRight: theme.spacing(1),
    },
    topBar: {
      display: 'flex',
    },
  })
);

interface Params {
  tutorialId: string;
}

type PropType = WithSnackbarProps & RouteComponentProps<Params>;

function Studentoverview({ match: { params }, enqueueSnackbar }: PropType): JSX.Element {
  const classes = useStyles();

  const [isLoading, setIsLoading] = useState(false);
  const [students, setStudents] = useState<StudentWithFetchedTeam[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [summaries, setSummaries] = useState<{ [studentId: string]: ScheinCriteriaSummary }>({});

  const dialog = useDialog();
  const {
    getTeamsOfTutorial,
    getStudentsOfTutorialAndFetchTeams,
    createStudentAndFetchTeam,
    createTeam,
    editStudentAndFetchTeam: editStudentRequest,
    deleteStudent: deleteStudentRequest,
    getScheinCriteriaSummariesOfAllStudentsOfTutorial,
  } = useAxios();

  const tutorialId: string = params.tutorialId;

  useEffect(() => {
    setIsLoading(true);

    (async function() {
      const [studentsResponse, teams] = await Promise.all([
        getStudentsOfTutorialAndFetchTeams(tutorialId),
        getTeamsOfTutorial(tutorialId),
      ]);

      getScheinCriteriaSummariesOfAllStudentsOfTutorial(tutorialId).then(response =>
        setSummaries(response)
      );
      setStudents(studentsResponse);
      setTeams(teams);
      setIsLoading(false);
    })();
  }, [
    getStudentsOfTutorialAndFetchTeams,
    getTeamsOfTutorial,
    getScheinCriteriaSummariesOfAllStudentsOfTutorial,
    tutorialId,
  ]);

  async function createTeamIfNeccessary(team: string | undefined): Promise<string | undefined> {
    if (team === CREATE_NEW_TEAM_VALUE) {
      const createdTeam = await createTeam(tutorialId, { students: [] });
      return createdTeam.id;
    } else {
      return team;
    }
  }

  const handleCreateStudent: StudentFormSubmitCallback = async (
    { firstname, lastname, matriculationNo, email, courseOfStudies, team },
    { setSubmitting, resetForm }
  ) => {
    const teamId = await createTeamIfNeccessary(team);

    const studentDTO: StudentDTO = {
      lastname,
      firstname,
      matriculationNo,
      email,
      courseOfStudies,
      tutorial: params.tutorialId,
      team: teamId || undefined,
    };

    try {
      const response = await createStudentAndFetchTeam(studentDTO);
      const teams = await getTeamsOfTutorial(tutorialId);

      setStudents([...students, response].sort(sortByName));
      setTeams(teams);

      resetForm({ values: getInitialStudentFormState(teams) });
      enqueueSnackbar('Student wurde erfolgreich erstellt.', { variant: 'success' });
    } catch (reason) {
      console.error(reason);
      enqueueSnackbar('Student konnte nicht erstellt werden.', { variant: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const editStudent: (
    student: StudentWithFetchedTeam
  ) => StudentFormSubmitCallback = student => async (
    { firstname, lastname, matriculationNo, email, courseOfStudies, team },
    { setSubmitting }
  ) => {
    const teamId = await createTeamIfNeccessary(team);

    const studentDTO: StudentDTO = {
      lastname,
      firstname,
      matriculationNo,
      email,
      courseOfStudies,
      tutorial: params.tutorialId,
      team: !teamId ? undefined : teamId,
    };

    try {
      const response = await editStudentRequest(student.id, studentDTO);
      const teams = await getTeamsOfTutorial(tutorialId);

      setStudents(
        students.map(stud => {
          if (stud.id === student.id) {
            return response;
          }

          return stud;
        })
      );
      setTeams(teams);

      enqueueSnackbar('Student wurde erfolgreich gespeichert.', { variant: 'success' });
      dialog.hide();
    } catch (reason) {
      console.error(reason);
      enqueueSnackbar('Student konnte nicht gespeichert werden.', { variant: 'error' });
      setSubmitting(false);
    }
  };

  function handleDeleteStudent(student: StudentWithFetchedTeam) {
    const nameOfStudent = getNameOfEntity(student);

    dialog.show({
      title: 'Nutzer löschen',
      content: `Soll der Student "${nameOfStudent}" wirklich gelöscht werden? Diese Aktion kann nicht rückgängig gemacht werden!`,
      actions: [
        {
          label: 'Nicht löschen',
          onClick: () => dialog.hide(),
        },
        {
          label: 'Löschen',
          onClick: () => deleteStudent(student),
          buttonProps: {
            className: classes.dialogDeleteButton,
          },
        },
      ],
    });
  }

  function handleEditStudent(student: StudentWithFetchedTeam) {
    dialog.show({
      title: 'Nutzer bearbeiten',
      content: (
        <StudentForm
          student={student}
          otherStudents={students.filter(s => s.id !== student.id)}
          teams={teams}
          onSubmit={editStudent(student)}
          onCancelClicked={() => dialog.hide()}
        />
      ),
      DialogProps: {
        maxWidth: 'lg',
      },
    });
  }

  async function deleteStudent(student: StudentWithFetchedTeam) {
    try {
      await deleteStudentRequest(student.id);
      const teams = await getTeamsOfTutorial(tutorialId);

      setStudents(students.filter(u => u.id !== student.id));
      setTeams(teams);

      enqueueSnackbar('Student/in wurde erfolgreich gelöscht.', { variant: 'success' });
    } catch {
      enqueueSnackbar('Student/in konnte nicht gelöscht werden.', { variant: 'error' });
    } finally {
      dialog.hide();
    }
  }

  return (
    <div className={classes.root}>
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <TableWithForm
          title='Neuen Studierenden anlegen'
          placeholder='Keine Studierenden vorhanden.'
          form={<StudentForm teams={teams} otherStudents={students} onSubmit={handleCreateStudent} />}
          items={students}
          createRowFromItem={student => (
            <ExtendableStudentRow
              student={student}
              summary={summaries[student.id]}
              onEditStudentClicked={handleEditStudent}
              onDeleteStudentClicked={handleDeleteStudent}
            />
          )}
        />
      )}
    </div>
  );
}

export default withRouter(withSnackbar(Studentoverview));
