import { Role } from 'shared/dist/model/Role';
import { Student } from 'shared/dist/model/Student';

function ScheinCriteriaClass(): ClassDecorator {
  return target => {
    console.log(`========================`);
    console.log(`Class name: ${target.name}`);
    console.log(Reflect.getMetadataKeys(target));
    console.log(`========================\n`);
  };
}

function ScheinCriteria(): PropertyDecorator {
  return (target, propertyKey) => {
    console.log(`========================`);
    const type = Reflect.getMetadata('design:type', target, propertyKey);

    console.log(`Property of ${target.constructor.name}:`);
    console.log(`${String(propertyKey)}: ${type.name}`);
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

@ScheinCriteriaClass()
export class DerpClass {
  @ScheinCriteria()
  private name!: string;

  @ScheinCriteria()
  private age!: number;

  @ScheinCriteria()
  private isTrue!: boolean;

  @ScheinCriteriaEnum(Role)
  private someEnum!: Role;

  @ScheinCriteria()
  private anObject!: object;

  @ScheinCriteria()
  private aCustomObject!: Student;
}
