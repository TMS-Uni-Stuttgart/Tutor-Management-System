import * as fs from 'fs';
import { StudentDocument } from '../documents/StudentDocument';

export abstract class Scheincriteria {
  readonly identifier: string;

  constructor(identifier: string) {
    this.identifier = identifier;
  }

  abstract isPassed(student: StudentDocument): boolean;
}

export interface ScheincriteriaMetadataKey {
  className: string;
  propertyName: string;
}

enum FormFieldType {
  STRING = 'STRING',
  INTEGER = 'INTEGER',
  FLOAT = 'FLOAT',
  SELECT = 'SELECT',
  BOOLEAN = 'BOOLEAN',
  ENUM = 'ENUM',
}

interface ScheincriteriaBaseMetadata {
  type: string;
}

interface ScheincriteriaIgnoreMetadata extends ScheincriteriaBaseMetadata {
  type: 'ignore';
}

interface ScheincriteriaNumberMetadata extends ScheincriteriaBaseMetadata {
  type: 'int' | 'float';
  min: number;
  max: number;
}

interface ScheincriteriaPercentageMetadata extends ScheincriteriaBaseMetadata {
  type: 'percentage';
}

interface ScheincriteriaPossiblePercentageMetadata extends ScheincriteriaBaseMetadata {
  type: 'possible-percentage';
  toggledBy: string;
}

export type ScheincriteriaMetadata =
  | ScheincriteriaNumberMetadata
  | ScheincriteriaIgnoreMetadata
  | ScheincriteriaPercentageMetadata
  | ScheincriteriaPossiblePercentageMetadata;

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
