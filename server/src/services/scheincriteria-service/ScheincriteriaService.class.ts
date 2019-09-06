import { ValidationErrorsWrapper } from 'shared/dist/model/errors/Errors';
import {
  FormBooleanFieldData,
  FormDataResponse,
  FormDataSet,
  FormEnumFieldData,
  FormFieldData,
  FormFloatFieldData,
  FormIntegerFieldData,
  FormSelectValue,
  FormStringFieldData,
} from 'shared/dist/model/FormTypes';
import {
  ScheinCriteriaDTO,
  ScheinCriteriaResponse,
  ScheincriteriaSummaryByStudents,
  ScheinCriteriaSummary,
} from 'shared/dist/model/ScheinCriteria';
import { validateSchema } from 'shared/dist/validators/helper';
import { Typegoose } from 'typegoose';
import * as Yup from 'yup';
import ScheincriteriaModel, {
  ScheincriteriaDocument,
  ScheincriteriaSchema,
} from '../../model/documents/ScheincriteriaDocument';
import { BadRequestError, DocumentNotFoundError } from '../../model/Errors';
import { Scheincriteria, ScheincriteriaYupSchema } from '../../model/scheincriteria/Scheincriteria';
import { ScheincriteriaForm } from '../../model/scheincriteria/ScheincriteriaForm';
import {
  ScheincriteriaMetadata,
  ScheincriteriaMetadataKey,
} from '../../model/scheincriteria/ScheincriteriaMetadata';
import { Student } from 'shared/dist/model/Student';
import studentService from '../student-service/StudentService.class';

interface ScheincriteriaWithId {
  criteriaId: string;
  criteriaName: string;
  criteria: Scheincriteria;
}

export class ScheincriteriaService {
  private criteriaMetadata: Map<string, ScheincriteriaMetadata>;
  private criteriaBluePrints: Map<string, ScheincriteriaForm>;
  private criteriaSchemas: Map<string, ScheincriteriaYupSchema>;

  constructor() {
    this.criteriaBluePrints = new Map();
    this.criteriaMetadata = new Map();
    this.criteriaSchemas = new Map();
  }

  public async getAllCriterias(): Promise<ScheinCriteriaResponse[]> {
    const criterias = await ScheincriteriaModel.find();

    return Promise.all(criterias.map(doc => this.getScheincriteriaOrReject(doc)));
  }

  private async getDocumentWithId(id: string): Promise<ScheincriteriaDocument> {
    const criteria: ScheincriteriaDocument | null = await ScheincriteriaModel.findById(id);

    if (!criteria) {
      return this.rejectScheincriteriaNotFound();
    }

    return criteria;
  }

  public async createCriteria(criteriaDTO: ScheinCriteriaDTO): Promise<ScheinCriteriaResponse> {
    const scheincriteria: Scheincriteria = this.generateCriteriaFromDTO(criteriaDTO);
    const documentData: Omit<ScheincriteriaSchema, keyof Typegoose> = {
      name: criteriaDTO.name,
      criteria: scheincriteria,
    };
    const criteriaDocument = await ScheincriteriaModel.create(documentData);

    return this.getScheincriteriaOrReject(criteriaDocument);
  }

  public async updateCriteria(
    id: string,
    criteriaDTO: ScheinCriteriaDTO
  ): Promise<ScheinCriteriaResponse> {
    const criteriaDoc = await this.getDocumentWithId(id);
    const updatedCriteria = this.generateCriteriaFromDTO(criteriaDTO);

    criteriaDoc.name = criteriaDTO.name;
    criteriaDoc.criteria = updatedCriteria;

    return this.getScheincriteriaOrReject(await criteriaDoc.save());
  }

  public async deleteCriteria(id: string): Promise<ScheinCriteriaResponse> {
    const criteria = await this.getDocumentWithId(id);

    return this.getScheincriteriaOrReject(await criteria.remove());
  }

  public async getCriteriaResultsOfAllStudents(): Promise<ScheincriteriaSummaryByStudents> {
    const summaries: ScheincriteriaSummaryByStudents = {};
    const [students, criterias] = await Promise.all([
      await studentService.getAllStudents(),
      this.getAllCriteriaObjects(),
    ]);

    for (const student of students) {
      summaries[student.id] = await this.getCriteriaResultOfStudent(student, criterias);
    }

    return summaries;
  }

  private async getCriteriaResultOfStudent(
    student: Student,
    criterias: ScheincriteriaWithId[]
  ): Promise<ScheinCriteriaSummary> {
    const criteriaSummaries: ScheinCriteriaSummary['scheinCriteriaSummary'] = {};
    let isPassed: boolean = true;

    for (const { criteriaId, criteriaName, criteria } of criterias) {
      const result = await criteria.checkCriteriaStatus(student);

      criteriaSummaries[criteriaId] = { id: criteriaId, name: criteriaName, ...result };

      if (!result.passed) {
        isPassed = false;
      }
    }

    return {
      passed: isPassed,
      scheinCriteriaSummary: criteriaSummaries,
    };
  }

  private async getAllCriteriaObjects(): Promise<ScheincriteriaWithId[]> {
    const criterias = await ScheincriteriaModel.find();

    return Promise.all(
      criterias.map(doc => ({
        criteriaId: doc.id,
        criteriaName: doc.name,
        criteria: this.generateCriteriaFromDocument(doc),
      }))
    );
  }

  private generateCriteriaFromDocument({ name, criteria }: ScheincriteriaDocument): Scheincriteria {
    const { identifier, ...data } = criteria;

    return this.generateCriteriaFromDTO({ identifier: criteria.identifier, data, name });
  }

  private generateCriteriaFromDTO({ identifier, data }: ScheinCriteriaDTO): Scheincriteria {
    const bluePrintData = this.criteriaBluePrints.get(identifier);

    if (!bluePrintData) {
      throw new Error(`No criteria found for identifier '${identifier}'.`);
    }

    // Get the constructor of the blueprint. The type needs to be set here because 'constructor' is only typed as 'Function' and therefore cannot be used with 'new' in front of it.
    const prototype = bluePrintData.blueprint.constructor as (new () => Scheincriteria);
    const criteria: Scheincriteria = Object.assign(new prototype(), data);

    return criteria;
  }

  private async getScheincriteriaOrReject({
    id,
    name,
    criteria,
  }: ScheincriteriaDocument): Promise<ScheinCriteriaResponse> {
    const response: ScheinCriteriaResponse = {
      id,
      identifier: criteria.identifier,
      name,
    };

    for (const key in criteria) {
      response[key] = (criteria as any)[key];
    }

    return response;
  }

  public async getFormData(): Promise<FormDataResponse> {
    const formData: FormDataResponse = {};

    this.criteriaBluePrints.forEach((form, key) => {
      const formDataSet: FormDataSet = {};
      form.formDataSet.forEach((data, dataKey) => {
        formDataSet[dataKey] = data;
      });

      formData[key] = formDataSet;
    });

    return formData;
  }

  public validateDataOfScheincriteriaDTO(
    obj: ScheinCriteriaDTO
  ): Yup.Shape<object, any> | ValidationErrorsWrapper {
    const schema = this.criteriaSchemas.get(obj.identifier);

    if (!schema) {
      throw new BadRequestError(
        `There is no schema registered for the given schein criteria identifier '${obj.identifier}`
      );
    }

    return validateSchema(schema, obj.data);
  }

  public registerBluePrint(criteria: Scheincriteria, validationSchema: ScheincriteriaYupSchema) {
    console.group(`Scheincriteria identifier: ${criteria.identifier}`);

    const criteriaForm = new ScheincriteriaForm(criteria);

    for (const [propertyName, propertyDescriptor] of Object.entries(
      Object.getOwnPropertyDescriptors(criteria)
    )) {
      const fieldData = this.getFormFieldDataForProperty(
        propertyName,
        propertyDescriptor,
        criteria
      );

      if (fieldData) {
        criteriaForm.formDataSet.set(propertyName, fieldData);
        console.log(`${fieldData.type} field '${propertyName}' added.`);
      }
    }

    this.criteriaBluePrints.set(criteria.identifier, criteriaForm);
    this.criteriaSchemas.set(criteria.identifier, validationSchema);

    console.log(`Criteria blue print with identifier '${criteria.identifier}' registered.`);
    console.groupEnd();
  }

  public unregisterBluePrint(criteria: Scheincriteria) {
    this.criteriaBluePrints.delete(criteria.identifier);
  }

  public addMetadata(key: ScheincriteriaMetadataKey, value: ScheincriteriaMetadata) {
    this.criteriaMetadata.set(this.getKeyAsString(key), value);
  }

  private getMetadata(target: Record<string, any>, propertyName: string): ScheincriteriaMetadata {
    let currentClass = target;

    while (!!currentClass) {
      const metadata = this.criteriaMetadata.get(
        this.getKeyAsString({
          className: currentClass.name || currentClass.constructor.name,
          propertyName,
        })
      );

      if (metadata) {
        return metadata;
      }

      currentClass = Object.getPrototypeOf(currentClass);
    }

    return { type: 'empty' };
  }

  private getFormFieldDataForProperty(
    propertyName: string,
    propertyDescriptor: PropertyDescriptor,
    criteria: Scheincriteria
  ): FormFieldData | undefined {
    if (propertyName === 'identifier') {
      return undefined;
    }

    const type = typeof propertyDescriptor.value;
    const metadata: ScheincriteriaMetadata = this.getMetadata(criteria, propertyName);

    if (metadata.type === 'ignore') {
      return undefined;
    }

    if (metadata.type === 'enum') {
      const enumValues = metadata.enumEntries.map(entry => new FormSelectValue(entry, entry));

      return new FormEnumFieldData(enumValues);
    }

    let fieldData: FormFieldData | undefined = undefined;

    switch (type) {
      case 'string':
        fieldData = new FormStringFieldData();
        break;

      case 'boolean':
        fieldData = new FormBooleanFieldData();
        break;

      case 'number':
      case 'bigint':
        if (metadata.type === 'empty') {
          throw new Error(
            `${propertyName} is a number. Number properties should have metadata to provide additional information. Please use @ScheincriteriaNumber() at the property ${propertyName}.`
          );
        }

        switch (metadata.type) {
          case 'int':
            fieldData = new FormIntegerFieldData({ min: metadata.min, max: metadata.max });
            break;

          case 'percentage':
            fieldData = new FormFloatFieldData({
              min: 0,
              max: 100,
              percentage: true,
              percentageToggleField: undefined,
            });
            break;

          case 'possible-percentage':
            fieldData = new FormFloatFieldData({ percentageToggleField: metadata.toggledBy });
            break;

          case 'float':
            fieldData = new FormFloatFieldData({ min: metadata.min, max: metadata.max });
            break;

          default:
            fieldData = new FormFloatFieldData({});
        }
        break;

      default:
        console.log(
          `Property '${propertyName}' with type '${type}' is not supported by the scheincriteria form systems.`
        );
    }

    return fieldData;
  }

  private getKeyAsString(key: ScheincriteriaMetadataKey): string {
    return `${key.className}::${key.propertyName}`;
  }

  private async rejectScheincriteriaNotFound(): Promise<any> {
    return Promise.reject(new DocumentNotFoundError('Scheincriteria with that ID was not found.'));
  }
}

const scheincriteriaService = new ScheincriteriaService();
export default scheincriteriaService;
