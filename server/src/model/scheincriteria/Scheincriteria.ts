import * as fs from 'fs';
import { ScheinCriteriaStatus } from 'shared/dist/model/ScheinCriteria';
import { Student } from 'shared/dist/model/Student';
import * as Yup from 'yup';
import Logger from '../../helpers/Logger';

export type StatusCheckResponse = Omit<ScheinCriteriaStatus, 'id' | 'name'>;

export abstract class Scheincriteria {
  readonly identifier: string;

  constructor(identifier: string) {
    this.identifier = identifier;
  }

  abstract async checkCriteriaStatus(student: Student): Promise<StatusCheckResponse>;
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
