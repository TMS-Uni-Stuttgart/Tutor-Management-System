import { Theme } from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/styles';
import { withSnackbar, WithSnackbarProps } from 'notistack';
import React, { useEffect, useState } from 'react';
import { RouteComponentProps, withRouter } from 'react-router';
import { ScheinCriteriaSummary } from 'shared/dist/model/ScheinCriteria';
import { StudentDTO } from 'shared/dist/model/Student';
import { Team } from 'shared/dist/model/Team';
import StudentForm, { StudentFormSubmitCallback } from '../../components/forms/StudentForm';
import LoadingSpinner from '../../components/LoadingSpinner';
import TableWithForm from '../../components/TableWithForm';
import { useDialog } from '../../hooks/DialogService';
import { useAxios } from '../../hooks/FetchingService';
import { StudentWithFetchedTeam } from '../../typings/types';
import { getNameOfEntity } from '../../util/helperFunctions';
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
  const {
    getTeamsOfTutorial,
    getStudentsOfTutorialAndFetchTeams,
    createStudentAndFetchTeam,
    editStudentAndFetchTeam: editStudentRequest,
    deleteStudent: deleteStudentRequest,
    getScheinCriteriaSummariesOfAllStudentsOfTutorial,
  } = useAxios();
  const dialog = useDialog();

  useEffect(() => {
    setIsLoading(true);

    (async function() {
      const [studentsResponse, teams] = await Promise.all([
        getStudentsOfTutorialAndFetchTeams(params.tutorialId),
        getTeamsOfTutorial(params.tutorialId),
      ]);

      getScheinCriteriaSummariesOfAllStudentsOfTutorial(params.tutorialId).then(response =>
        setSummaries(response)
      );
      setStudents(
        studentsResponse.sort((a, b) =>
          getNameOfEntity(a, { lastNameFirst: true }).localeCompare(
            getNameOfEntity(b, { lastNameFirst: true })
          )
        )
      );
      setTeams(teams);
      setIsLoading(false);
    })();
  }, [
    getStudentsOfTutorialAndFetchTeams,
    getTeamsOfTutorial,
    getScheinCriteriaSummariesOfAllStudentsOfTutorial,
    params.tutorialId,
  ]);

  const handleCreateStudent: StudentFormSubmitCallback = async (
    { firstname, lastname, matriculationNo, email, courseOfStudies, team },
    { setSubmitting, resetForm, setFieldError }
  ) => {
    const studentWithSameMatrNo: StudentWithFetchedTeam | undefined = students.find(
      student => student.matriculationNo === matriculationNo.toString()
    );

    if (studentWithSameMatrNo) {
      setFieldError('matriculationNo', 'Matrikelnummer bereits verwendet.');
      return;
    }
    const studentDTO: StudentDTO = {
      lastname,
      firstname,
      matriculationNo: matriculationNo.toString(),
      email,
      courseOfStudies,
      tutorial: params.tutorialId,
      team: !team ? undefined : team,
    };

    try {
      const response = await createStudentAndFetchTeam(studentDTO);
      setStudents(
        [...students, response].sort((a, b) =>
          `${a.lastname}, ${a.firstname}`.localeCompare(`${b.lastname}, ${b.firstname}`)
        )
      );
      resetForm();
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
    { setSubmitting, setFieldError }
  ) => {
    const studentWithSameMatrNo: StudentWithFetchedTeam | undefined = students.find(
      s => s.id !== student.id && s.matriculationNo === matriculationNo.toString()
    );

    if (studentWithSameMatrNo) {
      setFieldError('matriculationNo', 'Matrikelnummer bereits verwendet.');
      return;
    }

    const studentDTO: StudentDTO = {
      lastname,
      firstname,
      matriculationNo: matriculationNo.toString(),
      email,
      courseOfStudies,
      tutorial: params.tutorialId,
      team: !team ? undefined : team,
    };

    try {
      const response = await editStudentRequest(student.id, studentDTO);
      setStudents(
        students.map(stud => {
          if (stud.id === student.id) {
            return response;
          }

          return stud;
        })
      );

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
          teams={teams}
          onSubmit={editStudent(student)}
          onCancelClicked={() => dialog.hide()}
        />
      ),
    });
  }

  function deleteStudent(student: StudentWithFetchedTeam) {
    deleteStudentRequest(student.id)
      .then(() => {
        setStudents(students.filter(u => u.id !== student.id));
        enqueueSnackbar('Student wurde erfolgreich gelöscht.', { variant: 'success' });
      })
      .finally(() => dialog.hide());
  }

  return (
    <div className={classes.root}>
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <TableWithForm
          title='Neuen Studierenden anlegen'
          placeholder='Keine Studierenden vorhanden.'
          form={<StudentForm teams={teams} onSubmit={handleCreateStudent} />}
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
