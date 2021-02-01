import { ClassConstructor } from 'class-transformer';
import { FormFieldData } from '../../../shared/model/FormTypes';
import { Scheincriteria } from './Scheincriteria';

export type ScheincriteriaClass = ClassConstructor<Scheincriteria>;

export class ScheincriteriaForm {
    readonly blueprint: ScheincriteriaClass;
    readonly formDataSet: Map<string, FormFieldData>;

    constructor(blueprint: ScheincriteriaClass) {
        this.blueprint = blueprint;
        this.formDataSet = new Map();
    }
}
