/* tslint:disable */
/* eslint-disable */

import * as types from './ServerResponses';

export interface Exercise {
    bonus: boolean;
    exNo: number;
    maxPoints: number;
}

export interface HasPoints {
}

export interface PointId extends Serializable {
    exerciseNo: number;
    id: string;
}

export interface ScheinCriteria {
    id: string;
    identifier: string;
    name: string;
}

export interface ScheinExam extends types.HasId {
    date: Date;
    exercises: Exercise[];
    id: string;
    percentageNeeded: number;
    scheinExamNo: number;
}

export interface Serializable {
}

export interface Sheet extends types.HasId {
    bonusSheet: boolean;
    exercises: Exercise[];
    id: string;
    sheetNo: number;
}
