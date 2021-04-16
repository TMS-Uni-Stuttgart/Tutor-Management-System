import { ClassType } from '../../../helpers/ClassConstructor';
import { FormFieldData } from '../../../shared/model/FormTypes';
import { Scheincriteria } from './Scheincriteria';

export type ScheincriteriaClass = ClassType<Scheincriteria>;

export class ScheincriteriaForm {
    readonly blueprint: ScheincriteriaClass;
    readonly formDataSet: Map<string, FormFieldData>;

    constructor(blueprint: ScheincriteriaClass) {
        this.blueprint = blueprint;
        this.formDataSet = new Map();
    }
}
