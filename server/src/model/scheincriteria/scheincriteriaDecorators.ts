import scheincriteriaService from '../../services/scheincriteria-service/ScheincriteriaService.class';
import { ScheincriteriaMetadataKey } from './ScheincriteriaMetadata';

interface ScheincriteriaNumberOptions {
  min?: number;
  max?: number;
  numberType?: 'int' | 'float';
}

export function ScheincriteriaIgnore(): PropertyDecorator {
  return (target, propertyKey) => {
    scheincriteriaService.addMetadata(getMetadataKey(target, propertyKey), { type: 'ignore' });
  };
}

export function ScheincriteriaNumber({
  min,
  max,
  numberType,
}: ScheincriteriaNumberOptions = {}): PropertyDecorator {
  return (target, propertyKey) => {
    scheincriteriaService.addMetadata(getMetadataKey(target, propertyKey), {
      type: numberType === 'float' ? 'float' : 'int',
      min: min !== undefined ? min : Number.MIN_SAFE_INTEGER,
      max: max !== undefined ? max : Number.MAX_SAFE_INTEGER,
    });
  };
}

export function ScheincriteriaPercentage(): PropertyDecorator {
  return (target, propertyKey) => {
    scheincriteriaService.addMetadata(getMetadataKey(target, propertyKey), { type: 'percentage' });
  };
}

export function ScheincriteriaPossiblePercentage(toggledBy: string): PropertyDecorator {
  return (target, propertyKey) => {
    scheincriteriaService.addMetadata(getMetadataKey(target, propertyKey), {
      type: 'possible-percentage',
      toggledBy,
    });
  };
}

export function ScheincriteriaEnum(enumObject: any): PropertyDecorator {
  return (target, propertyKey) => {
    const enumEntries: string[] = Object.values<string | number>(enumObject).filter<string>(
      isString
    );

    scheincriteriaService.addMetadata(getMetadataKey(target, propertyKey), {
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

  return {
    className: obj.constructor.name,
    propertyName,
  };
}

function isString(val: any): val is string {
  return typeof val === 'string';
}
