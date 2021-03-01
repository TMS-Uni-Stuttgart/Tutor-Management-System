import { plainToClass } from 'class-transformer';
import _ from 'lodash';
import { useSnackbar } from 'notistack';
import { useCallback, useState } from 'react';
import { ScheincriteriaSummaryByStudents } from 'shared/model/ScheinCriteria';
import { IStudentDTO, StudentStatus } from 'shared/model/Student';
import { sortByName } from 'shared/util/helpers';
import { CREATE_NEW_TEAM_VALUE } from '../../../components/forms/StudentForm';
import {
  getScheinCriteriaSummariesOfAllStudentsOfTutorial,
  getScheinCriteriaSummaryOfAllStudents,
} from '../../../hooks/fetching/Scheincriteria';
import {
  createStudent as fetchCreateStudent,
  deleteStudent as fetchDeleteStudent,
  editStudent as fetchEditStudent,
} from '../../../hooks/fetching/Student';
import { createTeam, getTeamsOfTutorial } from '../../../hooks/fetching/Team';
import { useFetchState } from '../../../hooks/useFetchState';
import { Student } from '../../../model/Student';
import { Team } from '../../../model/Team';

export enum StudentSortOption {
  ALPHABETICAL = 'Alphabetisch',
  ACTIVE_FIRST = 'Aktive nach oben',
}

interface UseStudentsForStudentList {
  students: Student[];
  summaries: ScheincriteriaSummaryByStudents;
  teams: Team[] | undefined;
  isLoading: boolean;
  createStudent: (dto: IStudentDTO) => Promise<void>;
  editStudent: (student: Student, dto: IStudentDTO) => Promise<void>;
  deleteStudent: (student: Student) => Promise<void>;
  changeTutorialOfStudent: (student: Student, newTutorialId: string) => Promise<void>;
}

interface UseStudentsForStudentListParams {
  tutorialId?: string;
}

function unifyFilterableText(text: string): string {
  return _.deburr(text).toLowerCase();
}

async function createTeamIfNeccessary(
  tutorialId: string,
  team: string | undefined
): Promise<string | undefined> {
  if (team === CREATE_NEW_TEAM_VALUE) {
    const createdTeam = await createTeam(tutorialId, { students: [] });
    return createdTeam.id;
  } else {
    return team;
  }
}

export function useStudentsForStudentList({
  tutorialId,
}: UseStudentsForStudentListParams): UseStudentsForStudentList {
  const [students, setStudents] = useState<Student[]>([]);
  const { enqueueSnackbar } = useSnackbar();

  const [summaries = {}, isLoadingSummaries] = useFetchState({
    fetchFunction: async (tutorialId: string) => {
      const fetchedSummaries = await (tutorialId
        ? getScheinCriteriaSummariesOfAllStudentsOfTutorial(tutorialId)
        : getScheinCriteriaSummaryOfAllStudents());

      setStudents(
        Object.values(fetchedSummaries).map(({ student }) => plainToClass(Student, student))
      );

      return fetchedSummaries;
    },
    immediate: true,
    params: [tutorialId ?? ''],
  });
  const [teams, , , fetchTeams] = useFetchState({
    fetchFunction: tutorialId ? getTeamsOfTutorial : async () => undefined,
    immediate: true,
    params: [tutorialId ?? ''],
  });

  const createStudent = useCallback(
    async (dto: IStudentDTO) => {
      try {
        const teamId = await createTeamIfNeccessary(dto.tutorial, dto.team);
        dto.team = teamId !== '' ? teamId : undefined;
        const student = await fetchCreateStudent(dto);
        await fetchTeams(tutorialId ?? '');

        setStudents([...students, student].sort(sortByName));
        enqueueSnackbar(`${student.nameFirstnameFirst} wurde erfolgreich erstellt.`, {
          variant: 'success',
        });
      } catch {
        enqueueSnackbar('Studierende/r konnte nicht erstellt werden', { variant: 'error' });
      }
    },
    [students, enqueueSnackbar, fetchTeams, tutorialId]
  );

  const editStudent = useCallback(
    async (student: Student, dto: IStudentDTO) => {
      try {
        const studentId = student.id;
        const { team, tutorial, ...restOfDto } = dto;
        const teamId = await createTeamIfNeccessary(tutorial, team);

        const studentDTO: IStudentDTO = {
          ...restOfDto,
          tutorial,
          team: teamId,
        };

        const response = await fetchEditStudent(studentId, studentDTO);
        await fetchTeams(tutorialId ?? '');

        setStudents(
          students
            .map((stud) => {
              if (stud.id === studentId) {
                return response;
              }

              return stud;
            })
            .sort(sortByName)
        );
        enqueueSnackbar(`${student.nameFirstnameFirst} wurde erfolgreich gespeichert.`, {
          variant: 'success',
        });
      } catch {
        enqueueSnackbar(`${student.nameFirstnameFirst} konnte nicht gespeichert werden.`, {
          variant: 'error',
        });
      }
    },
    [students, tutorialId, fetchTeams, enqueueSnackbar]
  );

  const deleteStudent = useCallback(
    async (student: Student) => {
      try {
        await fetchDeleteStudent(student.id);

        setStudents(students.filter((s) => s.id !== student.id));
        enqueueSnackbar(`${student.nameFirstnameFirst} wurde erfolgreich gelöscht.`, {
          variant: 'success',
        });
      } catch {
        enqueueSnackbar(`${student.nameFirstnameFirst} konnte nicht gelöscht werden.`, {
          variant: 'error',
        });
      }
    },
    [students, enqueueSnackbar]
  );

  const changeTutorialOfStudent = useCallback(
    async (student: Student, newTutorialId: string) => {
      if (student.tutorial.id === newTutorialId) {
        return;
      }

      const dto: IStudentDTO = {
        ...student,
        tutorial: newTutorialId,
        team: undefined, // After the change the student must NOT have a team.
      };

      await editStudent(student, dto);
    },
    [editStudent]
  );

  return {
    students,
    teams,
    summaries,
    isLoading: isLoadingSummaries,
    createStudent,
    editStudent,
    deleteStudent,
    changeTutorialOfStudent,
  };
}

export function getFilteredStudents(
  students: Student[],
  filterText: string,
  sortOption: StudentSortOption
): Student[] {
  return students
    .filter((s) => {
      if (!filterText) {
        return true;
      }

      return unifyFilterableText(s.name).includes(unifyFilterableText(filterText));
    })
    .sort((a, b) => {
      switch (sortOption) {
        case StudentSortOption.ALPHABETICAL:
          return sortByName(a, b);

        case StudentSortOption.ACTIVE_FIRST:
          if (a.status !== b.status) {
            return a.status === StudentStatus.ACTIVE ? -1 : 1;
          } else {
            return sortByName(a, b);
          }

        default:
          return sortByName(a, b);
      }
    });
}
