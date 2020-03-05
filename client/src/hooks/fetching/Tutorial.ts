import { plainToClass } from 'class-transformer';
import { IStudent } from 'shared/model/Student';
import { ISubstituteDTO, ITutorial, ITutorialDTO } from 'shared/model/Tutorial';
import { sortByName } from 'shared/util/helpers';
import { Student } from '../../model/Student';
import { Tutorial } from '../../model/Tutorial';
import { StudentByTutorialSlotSummaryMap } from '../../typings/types';
import {
  transformMultipleTutorialResponse,
  transformTutorialResponse,
} from '../../util/axiosTransforms';
import axios from './Axios';
import { getScheinCriteriaSummaryOfAllStudents } from './Scheincriteria';

export async function getAllTutorials(): Promise<Tutorial[]> {
  const response = await axios.get<ITutorial[]>('tutorial', {
    transformResponse: transformMultipleTutorialResponse,
  });

  if (response.status === 200) {
    return plainToClass(Tutorial, response.data);
  }

  return Promise.reject(`Wrong response code (${response.status}).`);
}

export async function getTutorial(id: string): Promise<Tutorial> {
  const response = await axios.get<ITutorial>(`tutorial/${id}`, {
    transformResponse: transformTutorialResponse,
  });

  if (response.status === 200) {
    return plainToClass(Tutorial, response.data);
  }

  return Promise.reject(`Wrong response code (${response.status}).`);
}

export async function createTutorial(tutorialInformation: ITutorialDTO): Promise<Tutorial> {
  const response = await axios.post<ITutorial>('tutorial', tutorialInformation, {
    transformResponse: transformTutorialResponse,
  });

  if (response.status === 201) {
    return plainToClass(Tutorial, response.data);
  }

  return Promise.reject(`Wrong response code (${response.status}).`);
}

export async function editTutorial(
  id: string,
  tutorialInformation: ITutorialDTO
): Promise<ITutorial> {
  const response = await axios.patch<ITutorial>(`tutorial/${id}`, tutorialInformation, {
    transformResponse: transformTutorialResponse,
  });

  if (response.status === 200) {
    return response.data;
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
  substituteDTO: ISubstituteDTO
): Promise<ITutorial> {
  const response = await axios.put(`tutorial/${id}/substitute`, substituteDTO, {
    transformResponse: transformTutorialResponse,
  });

  if (response.status === 200) {
    return response.data;
  }

  return Promise.reject(`Wrong response code (${response.status}).`);
}

export async function getScheinCriteriaSummaryOfAllStudentsWithTutorialSlots(): Promise<
  StudentByTutorialSlotSummaryMap
> {
  const data: StudentByTutorialSlotSummaryMap = {};
  const [tutorials, summaries] = await Promise.all([
    getAllTutorials(),
    getScheinCriteriaSummaryOfAllStudents(),
  ]);

  Object.entries(summaries).forEach(([studentId, summary]) => {
    tutorials.forEach(tutorial => {
      if (tutorial.students.findIndex(id => id === studentId) !== -1) {
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
