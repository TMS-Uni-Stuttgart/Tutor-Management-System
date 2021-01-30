import { Scheincriteria } from './Scheincriteria';
import { FormFieldData } from '../../../shared/model/FormTypes';
import { ClassType } from 'class-transformer/ClassTransformer';

export type ScheincriteriaClass = ClassType<Scheincriteria>;

export class ScheincriteriaForm {
    readonly blueprint: ScheincriteriaClass;
    readonly formDataSet: Map<string, FormFieldData>;

    constructor(blueprint: ScheincriteriaClass) {
        this.blueprint = blueprint;
        this.formDataSet = new Map();
    }
}
