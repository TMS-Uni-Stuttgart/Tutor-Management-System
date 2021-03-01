import { logger } from '../../util/Logger';
import { FormDataSet } from './types/FieldData';
import { FormFieldType } from './types/FormFieldType';

export function generateInitialValue(formData: FormDataSet): Record<string, any> {
  const initialValues: { [key: string]: any } = {};

  Object.entries(formData).forEach(([name, data]) => {
    switch (data.type) {
      case FormFieldType.STRING:
        initialValues[name] = '';
        break;

      case FormFieldType.INTEGER:
      case FormFieldType.FLOAT:
        initialValues[name] = !!data.min && data.min <= 0 ? 0 : data.min;
        break;

      case FormFieldType.BOOLEAN:
        initialValues[name] = false;
        break;

      case FormFieldType.SELECT:
      case FormFieldType.ENUM:
        initialValues[name] = '';
        break;

      default:
        const { type } = data;
        logger.warn(
          `There's no initial value for the field "${name}" with it's type "${type}" configured. Initializing it with an empty string.`,
          { context: 'generateInitialValue' }
        );
        initialValues[name] = '';
    }
  });

  return initialValues;
}
