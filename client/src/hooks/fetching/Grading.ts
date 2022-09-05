import { Grading } from '../../model/Grading';
import { GradingResponseData } from 'shared/model/Gradings';
import axios from './Axios';
import { plainToClass } from 'class-transformer';
import { GradingList } from '../../model/GradingList';

export async function getGradingOfStudent(
    handInId: string,
    studentId: string
): Promise<Grading | undefined> {
    const response = await axios.get<GradingResponseData>(
        `/grading/handIn/${handInId}/student/${studentId}`
    );

    if (response.status === 200) {
        if (response.data.gradingData === undefined) {
            return undefined;
        } else {
            return plainToClass(Grading, response.data.gradingData);
        }
    }

    return Promise.reject(`Wrong response code (${response.status}).`);
}

export async function getGradingsOfTutorial(
    handInId: string,
    tutorialId: string
): Promise<GradingList> {
    const response = await axios.get<GradingResponseData[]>(
        `/grading/handIn/${handInId}/tutorial/${tutorialId}`
    );

    if (response.status === 200) {
        return new GradingList(response.data);
    }

    return Promise.reject(`Wrong response code (${response.status}).`);
}
