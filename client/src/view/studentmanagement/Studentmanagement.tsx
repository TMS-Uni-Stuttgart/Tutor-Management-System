import { TextField, Theme } from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/styles';
import _ from 'lodash';
import { AccountSearch as SearchIcon } from 'mdi-material-ui';
import { withSnackbar, WithSnackbarProps } from 'notistack';
import React, { useEffect, useState } from 'react';
import { RouteComponentProps, withRouter } from 'react-router';
import { ScheinCriteriaSummary } from 'shared/dist/model/ScheinCriteria';
import { StudentDTO } from 'shared/dist/model/Student';
import { Team } from 'shared/dist/model/Team';
import { getNameOfEntity, sortByName } from 'shared/dist/util/helpers';
import StudentForm, {
  CREATE_NEW_TEAM_VALUE,
  getInitialStudentFormState,
  StudentFormSubmitCallback,
} from '../../components/forms/StudentForm';
import LoadingSpinner from '../../components/LoadingSpinner';
import TableWithForm from '../../components/TableWithForm';
import { useDialog } from '../../hooks/DialogService';
import { useAxios } from '../../hooks/FetchingService';
import { StudentWithFetchedTeam } from '../../typings/types';
import ExtendableStudentRow from '../management/components/ExtendableStudentRow';
import StudentoverviewContextProvider from './NEW/Studentoverview.Context';
import NEWStudentoverview from './NEW/Studentoverview';
import {
  getStudentsOfTutorial,
  getScheinCriteriaSummariesOfAllStudentsOfTutorial,
} from '../../hooks/fetching/Tutorial';
import { getTeamsOfTutorial } from '../../hooks/fetching/Team';

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
    searchField: {
      width: '75%',
    },
  })
);

interface Params {
  tutorialId: string;
}

type PropType = WithSnackbarProps & RouteComponentProps<Params>;

function unifyFilterableText(text: string): string {
  return _.deburr(text).toLowerCase();
}

export function getFilteredStudents(
  students: StudentWithFetchedTeam[],
  filterText: string
): StudentWithFetchedTeam[] {
  if (!filterText) {
    return students;
  }

  return students.filter(s => {
    const name = getNameOfEntity(s, { lastNameFirst: false });

    return unifyFilterableText(name).includes(unifyFilterableText(filterText));
  });
}

function Studentoverview({ match: { params }, enqueueSnackbar }: PropType): JSX.Element {
  const classes = useStyles();

  const [isLoading, setIsLoading] = useState(false);
  const [students, setStudents] = useState<StudentWithFetchedTeam[]>([]);
  const [summaries, setSummaries] = useState<{ [studentId: string]: ScheinCriteriaSummary }>({});

  const tutorialId: string = params.tutorialId;

  useEffect(() => {
    setIsLoading(true);

    (async function() {
      const [studentsResponse, teams] = await Promise.all([
        getStudentsOfTutorial(tutorialId),
        getTeamsOfTutorial(tutorialId), // TODO: Remove me??
      ]);

      getScheinCriteriaSummariesOfAllStudentsOfTutorial(tutorialId)
        .then(response => setSummaries(response))
        .catch(() => {
          enqueueSnackbar('Konnte Ergebnisse der Scheinkriterien nicht abrufen.', {
            variant: 'error',
          });

          return [];
        });

      setStudents(studentsResponse);
      // setTeams(teams);
      setIsLoading(false);
    })();
  }, [
    getStudentsOfTutorial,
    getTeamsOfTutorial,
    getScheinCriteriaSummariesOfAllStudentsOfTutorial,
    tutorialId,
    enqueueSnackbar,
  ]);

  return (
    <StudentoverviewContextProvider students={students}>
      <div className={classes.root}>
        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <NEWStudentoverview tutorialId={tutorialId} summaries={summaries} />
        )}
      </div>
    </StudentoverviewContextProvider>
  );
  // const [teams, setTeams] = useState<Team[]>([]);

  // const [filterText, setFilterText] = useState<string>('');

  // const dialog = useDialog();
  // const {
  //   getTeamsOfTutorial,
  //   getStudentsOfTutorial,
  //   createStudent,
  //   createTeam,
  //   editStudent: editStudentRequest,
  //   deleteStudent: deleteStudentRequest,
  //   getScheinCriteriaSummariesOfAllStudentsOfTutorial,
  // } = useAxios();

  // async function createTeamIfNeccessary(team: string | undefined): Promise<string | undefined> {
  //   if (team === CREATE_NEW_TEAM_VALUE) {
  //     const createdTeam = await createTeam(tutorialId, { students: [] });
  //     return createdTeam.id;
  //   } else {
  //     return team;
  //   }
  // }

  // const handleCreateStudent: StudentFormSubmitCallback = async (
  //   { firstname, lastname, matriculationNo, email, courseOfStudies, team },
  //   { setSubmitting, resetForm }
  // ) => {
  //   const teamId = await createTeamIfNeccessary(team);

  //   const studentDTO: StudentDTO = {
  //     lastname,
  //     firstname,
  //     matriculationNo,
  //     email,
  //     courseOfStudies,
  //     tutorial: params.tutorialId,
  //     team: teamId || undefined,
  //   };

  //   try {
  //     const response = await createStudent(studentDTO);
  //     const teams = await getTeamsOfTutorial(tutorialId);

  //     setStudents([...students, response].sort(sortByName));
  //     setTeams(teams);

  //     resetForm({ values: getInitialStudentFormState(teams) });
  //     enqueueSnackbar('Student wurde erfolgreich erstellt.', { variant: 'success' });
  //   } catch (reason) {
  //     console.error(reason);
  //     enqueueSnackbar('Student konnte nicht erstellt werden.', { variant: 'error' });
  //   } finally {
  //     setSubmitting(false);
  //   }
  // };

  // const editStudent: (
  //   student: StudentWithFetchedTeam
  // ) => StudentFormSubmitCallback = student => async (
  //   { firstname, lastname, matriculationNo, email, courseOfStudies, team },
  //   { setSubmitting }
  // ) => {
  //   const teamId = await createTeamIfNeccessary(team);

  //   const studentDTO: StudentDTO = {
  //     lastname,
  //     firstname,
  //     matriculationNo,
  //     email,
  //     courseOfStudies,
  //     tutorial: params.tutorialId,
  //     team: !teamId ? undefined : teamId,
  //   };

  //   try {
  //     const response = await editStudentRequest(student.id, studentDTO);
  //     const teams = await getTeamsOfTutorial(tutorialId);

  //     setStudents(
  //       students.map(stud => {
  //         if (stud.id === student.id) {
  //           return response;
  //         }

  //         return stud;
  //       })
  //     );
  //     setTeams(teams);

  //     enqueueSnackbar('Student wurde erfolgreich gespeichert.', { variant: 'success' });
  //     dialog.hide();
  //   } catch (reason) {
  //     console.error(reason);
  //     enqueueSnackbar('Student konnte nicht gespeichert werden.', { variant: 'error' });
  //     setSubmitting(false);
  //   }
  // };

  // function handleDeleteStudent(student: StudentWithFetchedTeam) {
  //   const nameOfStudent = getNameOfEntity(student);

  //   dialog.show({
  //     title: 'Nutzer löschen',
  //     content: `Soll der Student "${nameOfStudent}" wirklich gelöscht werden? Diese Aktion kann nicht rückgängig gemacht werden!`,
  //     actions: [
  //       {
  //         label: 'Nicht löschen',
  //         onClick: () => dialog.hide(),
  //       },
  //       {
  //         label: 'Löschen',
  //         onClick: () => deleteStudent(student),
  //         buttonProps: {
  //           className: classes.dialogDeleteButton,
  //         },
  //       },
  //     ],
  //   });
  // }

  // function handleEditStudent(student: StudentWithFetchedTeam) {
  //   dialog.show({
  //     title: 'Nutzer bearbeiten',
  //     content: (
  //       <StudentForm
  //         student={student}
  //         otherStudents={students.filter(s => s.id !== student.id)}
  //         teams={teams}
  //         onSubmit={editStudent(student)}
  //         onCancelClicked={() => dialog.hide()}
  //       />
  //     ),
  //     DialogProps: {
  //       maxWidth: 'lg',
  //     },
  //   });
  // }

  // async function deleteStudent(student: StudentWithFetchedTeam) {
  //   try {
  //     await deleteStudentRequest(student.id);
  //     const teams = await getTeamsOfTutorial(tutorialId);

  //     setStudents(students.filter(u => u.id !== student.id));
  //     setTeams(teams);

  //     enqueueSnackbar('Student/in wurde erfolgreich gelöscht.', { variant: 'success' });
  //   } catch {
  //     enqueueSnackbar('Student/in konnte nicht gelöscht werden.', { variant: 'error' });
  //   } finally {
  //     dialog.hide();
  //   }
  // }

  // return (
  //   <div className={classes.root}>
  //     {isLoading ? (
  //       <LoadingSpinner />
  //     ) : (
  //       <TableWithForm
  //         title='Neuen Studierenden anlegen'
  //         placeholder='Keine Studierenden vorhanden.'
  //         form={
  //           <StudentForm teams={teams} otherStudents={students} onSubmit={handleCreateStudent} />
  //         }
  //         items={getFilteredStudents(students, filterText)}
  //         createRowFromItem={student => (
  //           <ExtendableStudentRow
  //             student={student}
  //             summary={summaries[student.id]}
  //             onEditStudentClicked={handleEditStudent}
  //             onDeleteStudentClicked={handleDeleteStudent}
  //           />
  //         )}
  //         topBarContent={
  //           <TextField
  //             variant='outlined'
  //             label='Suche'
  //             onChange={e => setFilterText(e.target.value)}
  //             className={classes.searchField}
  //             InputProps={{
  //               startAdornment: <SearchIcon color='disabled' />,
  //             }}
  //           />
  //         }
  //       />
  //     )}
  //   </div>
  // );
}

export default withRouter(withSnackbar(Studentoverview));
