import { plainToClass } from 'class-transformer';
import { IStudent } from 'shared/model/Student';
import {
  ISubstituteDTO,
  ITutorial,
  ITutorialDTO,
  ITutorialGenerationDTO,
} from 'shared/model/Tutorial';
import { sortByName } from 'shared/util/helpers';
import { Student } from '../../model/Student';
import { Tutorial } from '../../model/Tutorial';
import { StudentByTutorialSlotSummaryMap } from '../../typings/types';
import axios from './Axios';
import { getScheinCriteriaSummaryOfAllStudents } from './Scheincriteria';

export async function getAllTutorials(): Promise<Tutorial[]> {
  const response = await axios.get<ITutorial[]>('tutorial');

  if (response.status === 200) {
    return plainToClass(Tutorial, response.data);
  }

  return Promise.reject(`Wrong response code (${response.status}).`);
}

export async function getTutorial(id: string): Promise<Tutorial> {
  const response = await axios.get<ITutorial>(`tutorial/${id}`);

  if (response.status === 200) {
    return plainToClass(Tutorial, response.data);
  }

  return Promise.reject(`Wrong response code (${response.status}).`);
}

export async function createTutorial(tutorialInformation: ITutorialDTO): Promise<Tutorial> {
  const response = await axios.post<ITutorial>('tutorial', tutorialInformation);

  if (response.status === 201) {
    return plainToClass(Tutorial, response.data);
  }

  return Promise.reject(`Wrong response code (${response.status}).`);
}

export async function createMultipleTutorials(
  generationInformation: ITutorialGenerationDTO
): Promise<Tutorial[]> {
  const response = await axios.post<ITutorial[]>('tutorial/generate', generationInformation);

  if (response.status === 201) {
    return plainToClass(Tutorial, response.data);
  }

  return Promise.reject(`Wrong response code (${response.status})`);
}

export async function editTutorial(
  id: string,
  tutorialInformation: ITutorialDTO
): Promise<Tutorial> {
  const response = await axios.patch<ITutorial>(`tutorial/${id}`, tutorialInformation);

  if (response.status === 200) {
    return plainToClass(Tutorial, response.data);
  }

  return Promise.reject(`Wrong response code (${response.status}).`);
}

export async function deleteTutorial(id: string): Promise<void> {
  const response = await axios.delete(`tutorial/${id}`);

  if (response.status !== 204) {
    return Promise.reject(`Wrong response code (${response.status}).`);
  }
}

export async function getStudentsOfTutorial(id: string): Promise<Student[]> {
  const response = await axios.get<IStudent[]>(`tutorial/${id}/student`);

  if (response.status === 200) {
    const data = plainToClass(Student, response.data);
    return data.sort(sortByName);
  }

  return Promise.reject(`Wrong response code (${response.status}).`);
}

export async function setSubstituteTutor(
  id: string,
  substituteDTO: ISubstituteDTO | ISubstituteDTO[]
): Promise<void> {
  const response = await axios.put<void>(`tutorial/${id}/substitute`, substituteDTO);

  if (response.status !== 200) {
    return Promise.reject(`Wrong response code (${response.status}).`);
  }
}

export async function getScheinCriteriaSummaryOfAllStudentsWithTutorialSlots(): Promise<StudentByTutorialSlotSummaryMap> {
  const data: StudentByTutorialSlotSummaryMap = {};
  const [tutorials, summaries] = await Promise.all([
    getAllTutorials(),
    getScheinCriteriaSummaryOfAllStudents(),
  ]);

  Object.entries(summaries).forEach(([studentId, summary]) => {
    tutorials.forEach((tutorial) => {
      if (tutorial.students.findIndex((id) => id === studentId) !== -1) {
        const key: string = tutorial.slot.toString();

        if (!data[key]) {
          data[key] = [];
        }

        data[key].push(summary);
      }
    });
  });

  return data;
}
