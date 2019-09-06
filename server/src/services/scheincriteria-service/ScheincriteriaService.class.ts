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
import { ScheinCriteriaDTO, ScheinCriteriaResponse } from 'shared/dist/model/ScheinCriteria';
import { Typegoose } from 'typegoose';
import ScheincriteriaModel, {
  ScheincriteriaDocument,
  ScheincriteriaSchema,
} from '../../model/documents/ScheincriteriaDocument';
import { Scheincriteria } from '../../model/scheincriteria/Scheincriteria';
import { ScheincriteriaForm } from '../../model/scheincriteria/ScheincriteriaForm';
import {
  ScheincriteriaMetadata,
  ScheincriteriaMetadataKey,
} from '../../model/scheincriteria/ScheincriteriaMetadata';

export class ScheincriteriaService {
  private criteriaMetadata: Map<string, ScheincriteriaMetadata>;
  private criteriaBluePrints: Map<string, ScheincriteriaForm>;

  constructor() {
    this.criteriaBluePrints = new Map();
    this.criteriaMetadata = new Map();
  }

  public async getAllCriterias(): Promise<ScheinCriteriaResponse[]> {
    const criterias = await ScheincriteriaModel.find();

    return Promise.all(criterias.map(doc => this.getResponseOrReject(doc)));
  }

  public async createCriteria(criteriaDTO: ScheinCriteriaDTO): Promise<ScheinCriteriaResponse> {
    const scheincriteria: Scheincriteria = this.generateCriteriaFromDTO(criteriaDTO);
    const documentData: Omit<ScheincriteriaSchema, keyof Typegoose> = {
      name: criteriaDTO.name,
      criteria: scheincriteria,
    };
    const criteriaDocument = await ScheincriteriaModel.create(documentData);

    return this.getResponseOrReject(criteriaDocument);
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

  private async getResponseOrReject({
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

  public registerBluePrint(criteria: Scheincriteria) {
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

    console.log(`Criteria blue print with identifier '${criteria.identifier}' registered.`);
    console.groupEnd();
  }

  public unregisterBluePrint(criteria: Scheincriteria) {
    this.criteriaBluePrints.delete(criteria.identifier);
  }

  public addMetadata(key: ScheincriteriaMetadataKey, value: ScheincriteriaMetadata) {
    this.criteriaMetadata.set(this.getKeyAsString(key), value);
  }

  public getBluePrintCount(): number {
    return this.criteriaBluePrints.size;
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
}

const scheincriteriaService = new ScheincriteriaService();
export default scheincriteriaService;
