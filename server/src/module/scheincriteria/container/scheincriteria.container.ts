import { ScheincriteriaForm } from './scheincriteria.form';
import { ScheincriteriaMetadata, ScheincriteriaMetadataKey } from './scheincriteria.metadata';
import { Scheincriteria } from './Scheincriteria';
import { Logger } from '@nestjs/common';
import {
  FormFieldData,
  FormSelectValue,
  FormEnumFieldData,
  FormStringFieldData,
  FormBooleanFieldData,
  FormIntegerFieldData,
  FormFloatFieldData,
} from '../../../shared/model/FormTypes';

class SCContainer {
  private readonly criteriaMetadata: Map<string, ScheincriteriaMetadata>;
  private readonly criteriaBluePrints: Map<string, ScheincriteriaForm>;

  constructor() {
    this.criteriaMetadata = new Map();
    this.criteriaBluePrints = new Map();
  }

  /**
   * Saves the given metadata for the given key.
   *
   * If there already is saved data for that key the saved value will be overridden.
   *
   * @param key Key of the metadata to save.
   * @param value Metadata to save.
   */
  addMetadata(key: ScheincriteriaMetadataKey, value: ScheincriteriaMetadata) {
    this.criteriaMetadata.set(key.toString(), value);
  }

  /**
   * Searches the saved metadata for the given target class and it's property name. The found metadata is returned.
   *
   * If no metadata could be found for the given combination of class and property name the 'empty metadata' `{ type: 'empty' }` gets returned.
   *
   * @param target Target class to search the metadata for.
   * @param propertyName Name of the property inside the class or any of it's parent classes to search the metadata for.
   *
   * @returns If the metadata could be found it will be returned. Else `{ type: 'empty' }` ('empty metadata') will be return instead.
   */
  getMetadata(target: Record<string, any>, propertyName: string): ScheincriteriaMetadata {
    let currentClass = target;

    while (!!currentClass) {
      const key = new ScheincriteriaMetadataKey(
        currentClass.name || currentClass.constructor.name,
        propertyName
      );
      const metadata = this.criteriaMetadata.get(key.toString());

      if (!!metadata) {
        return metadata;
      }

      currentClass = Object.getPrototypeOf(currentClass);
    }

    return { type: 'empty' };
  }

  /*
   * TODO: JSDoc
   */
  registerBluePrint(criteria: Scheincriteria) {
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
        Logger.log(`\t${fieldData.type} field '${propertyName}' added.`, SCContainer.name);
      }
    }

    this.criteriaBluePrints.set(criteria.identifier, criteriaForm);

    Logger.log(`\tCriteria blue print with identifier '${criteria.identifier}' registered.`);
  }

  private getFormFieldDataForProperty(
    propertyName: string,
    propertyDescriptor: PropertyDescriptor,
    criteria: Scheincriteria
  ): FormFieldData | undefined {
    /*
     * TODO: Clean & split up function
     * TODO: JSDoc(s)!
     */
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

    let fieldData: FormFieldData | undefined;

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
        Logger.warn(
          `Property '${propertyName}' with type '${type}' is not supported by the scheincriteria form system.`
        );
    }

    return fieldData;
  }
}

/**
 * Static wrapper for the container holding the information of all scheincriterias.
 */
export abstract class ScheincriteriaContainer {
  private static readonly container: SCContainer = new SCContainer();

  static getContainer(): SCContainer {
    return this.container;
  }
}
