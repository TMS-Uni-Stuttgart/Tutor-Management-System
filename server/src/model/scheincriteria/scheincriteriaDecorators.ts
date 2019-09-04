import scheincriteriaService, {
  ScheincriteriaMetadataKey,
} from '../../services/scheincriteria-service/ScheincriteriaService.class';

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

function ScheinCriteriaEnum(enumObject: any): PropertyDecorator {
  return (target, propertyKey) => {
    console.log(`========================`);
    // Reflect.defineMetadata('design:type', { name: 'derpy derp' }, target, propertyKey);
    // const Type = Reflect.getMetadata('design:type', target, propertyKey);
    console.log(`${String(propertyKey)}: Enum`);
    console.log(`Enum values: [${Object.values(enumObject)}]`);
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
