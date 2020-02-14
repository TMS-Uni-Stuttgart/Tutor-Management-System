import { Scheincriteria } from './Scheincriteria';
import { FormFieldData } from 'shared/dist/model/FormTypes';

export class ScheincriteriaForm {
  readonly blueprint: Scheincriteria;
  readonly formDataSet: Map<string, FormFieldData>;

  constructor(blueprint: Scheincriteria) {
    this.blueprint = blueprint;
    this.formDataSet = new Map();
  }
}
