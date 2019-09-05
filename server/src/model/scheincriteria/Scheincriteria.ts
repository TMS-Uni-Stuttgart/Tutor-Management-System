import * as fs from 'fs';
import { StudentDocument } from '../documents/StudentDocument';

export abstract class Scheincriteria {
  readonly identifier: string;

  constructor(identifier: string) {
    this.identifier = identifier;
  }

  abstract isPassed(student: StudentDocument): boolean;
}

export function initScheincriteriaBlueprints() {
  console.group('Scanning for schein criterias...');

  fs.readdirSync(__dirname + '/criterias')
    .filter(file => file.match(/\.(js|ts)$/) !== null)
    .forEach(file => {
      require('./criterias/' + file);
    });

  console.groupEnd();
  console.log('Scanning for schein criterias finished.');
}
