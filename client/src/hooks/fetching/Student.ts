import { plainToInstance } from 'class-transformer';
import { IAttendance, IAttendanceDTO } from 'shared/model/Attendance';
import { IGradingDTO, IPresentationPointsDTO } from 'shared/model/Gradings';
import {
    ICakeCountDTO,
    ICreateStudentDTO,
    ICreateStudentsDTO,
    IStudent,
} from 'shared/model/Student';
import { sortByName } from 'shared/util/helpers';
import { Student } from '../../model/Student';
import axios from './Axios';

export async function getAllStudents(): Promise<Student[]> {
    const response = await axios.get<IStudent[]>('student');

    if (response.status === 200) {
        const data = plainToInstance(Student, response.data);
        return data.sort(sortByName);
    }

    return Promise.reject(`Wrong response code (${response.status}).`);
}

export async function getStudent(studentId: string): Promise<Student> {
    const response = await axios.get<IStudent>(`student/${studentId}`);

    if (response.status === 200) {
        return plainToInstance(Student, response.data);
    }

    return Promise.reject(`Wrong response code (${response.status}).`);
}

export async function createStudent(studentInfo: ICreateStudentDTO): Promise<Student> {
    const response = await axios.post<IStudent>('student', studentInfo);

    if (response.status === 201) {
        return plainToInstance(Student, response.data);
    }

    return Promise.reject(`Wrong response code (${response.status}).`);
}

export async function createManyStudents(dto: ICreateStudentsDTO): Promise<IStudent[]> {
    const response = await axios.post<IStudent[]>('student/generate', dto);

    if (response.status === 201) {
        return response.data;
    }

    return Promise.reject(`Wrong response code (${response.status}).`);
}

export async function editStudent(id: string, studentInfo: ICreateStudentDTO): Promise<Student> {
    const response = await axios.patch<IStudent>(`student/${id}`, studentInfo);

    if (response.status === 200) {
        return plainToInstance(Student, response.data);
    }

    return Promise.reject(`Wrong response code (${response.status}).`);
}

export async function deleteStudent(id: string): Promise<void> {
    const response = await axios.delete(`student/${id}`);

    if (response.status !== 204) {
        return Promise.reject(`Wrong response code (${response.status}).`);
    }
}

export async function setAttendanceOfStudent(
    id: string,
    attendanceInfo: IAttendanceDTO
): Promise<IAttendance> {
    const response = await axios.put<IAttendance>(`student/${id}/attendance`, attendanceInfo);

    if (response.status === 200) {
        return response.data;
    }

    return Promise.reject(`Wrong status code (${response.status}).`);
}

export async function setPointsOfMultipleStudents(points: Map<string, IGradingDTO>): Promise<void> {
    // Timeout = 0 to prevent the request from running into a timeout.
    const response = await axios.put('grading/multiple', [...points], { timeout: 0 });

    if (response.status !== 204) {
        return Promise.reject(`Wrong status code (${response.status}).`);
    }
}

export async function setPointsOfStudent(studentId: string, points: IGradingDTO): Promise<void> {
    const response = await axios.put(`grading/student/${studentId}`, points);

    if (response.status !== 204) {
        return Promise.reject(`Wrong status code (${response.status}).`);
    }
}

export async function setPresentationPointsOfStudent(
    studentId: string,
    points: IPresentationPointsDTO
): Promise<void> {
    const response = await axios.put(`student/${studentId}/presentation`, points);

    if (response.status !== 204) {
        return Promise.reject(`Wrong status code (${response.status}).`);
    }
}

export async function setExamPointsOfStudent(
    studentId: string,
    points: IGradingDTO
): Promise<void> {
    const response = await axios.put(`grading/student/${studentId}`, points);

    if (response.status !== 204) {
        return Promise.reject(`Wrong response code (${response.status}).`);
    }
}

export async function setCakeCountForStudent(
    studentId: string,
    cakeCountDTO: ICakeCountDTO
): Promise<void> {
    const response = await axios.put(`student/${studentId}/cakecount`, cakeCountDTO);

    if (response.status !== 204) {
        return Promise.reject(`Wrong response code (${response.status}).`);
    }
}
