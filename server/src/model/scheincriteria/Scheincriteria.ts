import * as fs from 'fs';
import { ScheinCriteriaStatus, CriteriaInformation } from 'shared/dist/model/ScheinCriteria';
import { Student } from 'shared/dist/model/Student';
import * as Yup from 'yup';
import Logger from '../../helpers/Logger';
import { StudentDocument } from '../documents/StudentDocument';

export type StatusCheckResponse = Omit<ScheinCriteriaStatus, 'id' | 'name'>;
export type CriteriaInformationWithoutName = Omit<CriteriaInformation, 'name' | 'studentSummaries'>;

export abstract class Scheincriteria {
  readonly identifier: string;

  constructor(identifier: string) {
    this.identifier = identifier;
  }

  abstract async checkCriteriaStatus(student: StudentDocument): Promise<StatusCheckResponse>;

  abstract async getInformation(students: StudentDocument[]): Promise<CriteriaInformationWithoutName>;
}

export type ScheincriteriaYupSchema = Yup.Schema<any>;

export function initScheincriteriaBlueprints() {
  Logger.info('Scanning for schein criteria...');

  fs.readdirSync(__dirname + '/criterias')
    .filter(file => file.match(/\.(js|ts)$/) !== null)
    .forEach(file => {
      require('./criterias/' + file);
    });

  Logger.info('Scanning for schein criterias finished.');
}
