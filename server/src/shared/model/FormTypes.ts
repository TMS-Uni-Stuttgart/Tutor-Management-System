enum FormFieldType {
  STRING = 'STRING',
  INTEGER = 'INTEGER',
  FLOAT = 'FLOAT',
  SELECT = 'SELECT',
  BOOLEAN = 'BOOLEAN',
  ENUM = 'ENUM',
}

export class FormSelectValue<T> {
  readonly identifier: string;
  readonly value: T;
  readonly displayValue?: string;

  constructor(identifier: string, value: T, displayValue?: string) {
    this.identifier = identifier;
    this.value = value;
    this.displayValue = displayValue;
  }
}

interface FloatFieldDataOptions {
  min?: number;
  max?: number;
  percentage?: boolean;
  percentageToggleField?: string;
}

interface IntegerFieldDataOptions {
  min?: number;
  max?: number;
}

export abstract class FormFieldData {
  readonly type: FormFieldType;

  constructor(type: FormFieldType) {
    this.type = type;
  }
}

export class FormBooleanFieldData extends FormFieldData {
  constructor() {
    super(FormFieldType.BOOLEAN);
  }
}

export class FormEnumFieldData<E> extends FormFieldData {
  readonly enumValues: FormSelectValue<E>[];

  constructor(enumValues: FormSelectValue<E>[]) {
    super(FormFieldType.ENUM);

    this.enumValues = enumValues;
  }
}

export class FormFloatFieldData extends FormFieldData {
  readonly min: number;
  readonly max: number;
  readonly percentage: boolean;
  readonly percentageToggleField?: string;

  constructor({ min, max, percentage, percentageToggleField }: FloatFieldDataOptions) {
    super(FormFieldType.FLOAT);

    this.min = min !== undefined ? min : Number.MIN_SAFE_INTEGER;
    this.max = max !== undefined ? max : Number.MAX_SAFE_INTEGER;
    this.percentage = !!percentage;
    this.percentageToggleField = percentageToggleField;
  }
}

export class FormIntegerFieldData extends FormFieldData {
  readonly min: number;
  readonly max: number;

  constructor({ min, max }: IntegerFieldDataOptions) {
    super(FormFieldType.INTEGER);

    this.min = min !== undefined ? min : Number.MIN_SAFE_INTEGER;
    this.max = max !== undefined ? max : Number.MAX_SAFE_INTEGER;
  }
}

export class FormSelectFieldData<T> extends FormFieldData {
  readonly values: FormSelectValue<T>[];

  constructor(values: FormSelectValue<T>[]) {
    super(FormFieldType.SELECT);

    this.values = values;
  }
}

export class FormStringFieldData extends FormFieldData {
  constructor() {
    super(FormFieldType.STRING);
  }
}

export interface FormDataSet {
  [name: string]: FormFieldData;
}

export interface FormDataResponse {
  [id: string]: FormDataSet;
}
