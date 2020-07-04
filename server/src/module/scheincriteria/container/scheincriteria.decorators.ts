import { ScheincriteriaContainer } from './scheincriteria.container';
import { ScheincriteriaMetadataKey } from './scheincriteria.metadata';

interface ScheincriteriaNumberOptions {
  min?: number;
  max?: number;
  numberType?: 'int' | 'float';
}

export function ScheincriteriaIgnore(): PropertyDecorator {
  return (target, propertyKey) => {
    ScheincriteriaContainer.getContainer().addMetadata(getMetadataKey(target, propertyKey), {
      type: 'ignore',
    });
  };
}

export function ScheincriteriaNumber({
  min,
  max,
  numberType,
}: ScheincriteriaNumberOptions = {}): PropertyDecorator {
  return (target, propertyKey) => {
    ScheincriteriaContainer.getContainer().addMetadata(getMetadataKey(target, propertyKey), {
      type: numberType === 'float' ? 'float' : 'int',
      min: min !== undefined ? min : Number.MIN_SAFE_INTEGER,
      max: max !== undefined ? max : Number.MAX_SAFE_INTEGER,
    });
  };
}

export function ScheincriteriaPercentage(): PropertyDecorator {
  return (target, propertyKey) => {
    ScheincriteriaContainer.getContainer().addMetadata(getMetadataKey(target, propertyKey), {
      type: 'percentage',
    });
  };
}

export function ScheincriteriaPossiblePercentage(toggledBy: string): PropertyDecorator {
  return (target, propertyKey) => {
    ScheincriteriaContainer.getContainer().addMetadata(getMetadataKey(target, propertyKey), {
      type: 'possible-percentage',
      toggledBy,
    });
  };
}

export function ScheincriteriaEnum(enumObject: Record<string, string | number>): PropertyDecorator {
  return (target, propertyKey) => {
    const enumEntries: string[] = Object.values<string | number>(enumObject).filter<string>(
      isString
    );

    ScheincriteriaContainer.getContainer().addMetadata(getMetadataKey(target, propertyKey), {
      type: 'enum',
      enumEntries,
    });
  };
}

function getMetadataKey(
  obj: Record<string, any>,
  propertyKey: string | symbol
): ScheincriteriaMetadataKey {
  const propertyName: string = String(propertyKey);

  return new ScheincriteriaMetadataKey(obj.constructor.name, propertyName);
}

function isString(val: any): val is string {
  return typeof val === 'string';
}
