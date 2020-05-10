import { InternalServerErrorException, Logger } from '@nestjs/common';
import { DecoratorKeys } from '@typegoose/typegoose/lib/internal/constants';
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
} from '../../../shared/model/FormTypes';
import { Scheincriteria } from './Scheincriteria';
import { ScheincriteriaClass, ScheincriteriaForm } from './scheincriteria.form';
import { ScheincriteriaMetadata, ScheincriteriaMetadataKey } from './scheincriteria.metadata';

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

  /**
   * Registers a blueprint for the given criteria. This allows the instantiation of those later.
   *
   * @param criteria Criteria to register a blue print for.
   */
  registerBluePrint(criteriaClass: ScheincriteriaClass) {
    const criteriaForm = new ScheincriteriaForm(criteriaClass);
    const criteria = new criteriaClass();

    for (const [propertyName] of Object.entries(Object.getOwnPropertyDescriptors(criteria))) {
      const fieldData = this.getFormFieldDataForProperty(propertyName, criteria);

      if (fieldData) {
        criteriaForm.formDataSet.set(propertyName, fieldData);
        Logger.log(
          `${fieldData.type} field '${propertyName}' added.`,
          `Criteria: ${criteria.identifier}`
        );
      }
    }

    this.criteriaBluePrints.set(criteria.identifier, criteriaForm);
  }

  /**
   * Returns the blue print of the given identifier if there is one saved.
   *
   * @param identifier Identifier to get blue print of.
   *
   * @returns Blue print of the given identifiert.
   *
   * @throws `NotFoundException` - If no blue print of the given identifier could be found.
   */
  getBluePrint(identifier: string): ScheincriteriaForm {
    const bluePrint = this.criteriaBluePrints.get(identifier);

    if (!bluePrint) {
      throw new InternalServerErrorException(
        `No criteria blue print found for identifier '${identifier}'.`
      );
    }

    return bluePrint;
  }

  /**
   * Parses the loaded blueprints into a map that contains the form data for each criteria by their identifier as key.
   *
   * Those form datas are parsed from the decorators insinde the loaded criteria and initially set at registering the blueprint.
   *
   * @returns Parsed form data.
   */
  getFormData(): FormDataResponse {
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

  /**
   * Gathers the data for the form using the given property of the given criteria.
   *
   * If the `propertyName` is 'identifier' or if the type of the property with the given name is not supported than `undefined` is returned.
   *
   * @param propertyName Name of the property to get the FormFieldData of.
   * @param criteria Criteria containing the corresponding property.
   *
   * @returns The FormFieldData for the property or `undefined` (see above).
   */
  private getFormFieldDataForProperty(
    propertyName: string,
    criteria: Scheincriteria
  ): FormFieldData | undefined {
    /*
     * TODO: Clean & split up function
     */
    if (propertyName === 'identifier') {
      return undefined;
    }

    const metadata: ScheincriteriaMetadata = this.getMetadata(criteria, propertyName);
    const type = Reflect.getMetadata(
      DecoratorKeys.Type,
      criteria,
      propertyName
    )?.name?.toLowerCase();

    if (metadata.type === 'ignore') {
      return undefined;
    }

    if (metadata.type === 'enum') {
      const enumValues = metadata.enumEntries.map((entry) => new FormSelectValue(entry, entry));

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
          `Property '${propertyName}' with type '${type}' is not supported by the scheincriteria form system.`,
          `Criteria: ${criteria.identifier}`
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
