import { FormFieldType } from './FormFieldType';

interface FormFieldDataBase {
  type: FormFieldType;
}

interface FormStringFieldData extends FormFieldDataBase {
  type: FormFieldType.STRING;
}

interface FormIntegerFieldData extends FormFieldDataBase {
  type: FormFieldType.INTEGER;
  min?: number;
  max?: number;
}

interface FormFloatFieldData extends Omit<FormIntegerFieldData, 'type'> {
  type: FormFieldType.FLOAT;
  percentageToggleField?: string;
  percentage: boolean;
}

interface FormSelectFieldData extends FormFieldDataBase {
  type: FormFieldType.SELECT;
  values: FormSelectValue[];
}

interface FormBooleanFieldData extends FormFieldDataBase {
  type: FormFieldType.BOOLEAN;
}

interface FormEnumFieldData extends FormFieldDataBase {
  type: FormFieldType.ENUM;
  enumValues: FormSelectValue[];
}

interface FormSelectValue {
  identifier: string;
  value: any;
  displayValue?: string;
}

// interface FormArrayFieldData extends FormFieldDataBase {
//   type: FormFieldType.ARRAY;
// }

export type FormFieldData =
  | FormStringFieldData
  | FormIntegerFieldData
  | FormFloatFieldData
  | FormSelectFieldData
  | FormBooleanFieldData
  | FormEnumFieldData;

export interface FormDataSet {
  [name: string]: FormFieldData;
}

export interface FormDataResponse {
  [id: string]: FormDataSet;
}
