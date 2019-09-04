import { StudentDocument } from '../../model/documents/StudentDocument';

export abstract class Scheincriteria {
  readonly identifier: string;

  constructor(identifier: string) {
    this.identifier = identifier;
  }

  abstract isPassed(student: StudentDocument): boolean;
}

export interface ScheincriteriaMetadataKey {
  className: string;
  propertyName: string;
}

interface ScheincriteriaBaseMetadata {
  type: string;
}

interface ScheincriteriaIgnoreMetadata extends ScheincriteriaBaseMetadata {
  type: 'ignore';
}

interface ScheincriteriaNumberMetadata extends ScheincriteriaBaseMetadata {
  type: 'number';
  min: number;
  max: number;
}

interface ScheincriteriaPercentageMetadata extends ScheincriteriaBaseMetadata {
  type: 'percentage';
}

interface ScheincriteriaPossiblePercentageMetadata extends ScheincriteriaBaseMetadata {
  type: 'possible-percentage';
  toggledBy: string;
}

type ScheincriteriaMetadata =
  | ScheincriteriaNumberMetadata
  | ScheincriteriaIgnoreMetadata
  | ScheincriteriaPercentageMetadata
  | ScheincriteriaPossiblePercentageMetadata;

export class ScheincriteriaService {
  private criteriaMetadata: Map<string, ScheincriteriaMetadata>;
  private criteriaBluePrints: Map<string, Scheincriteria>;

  constructor() {
    this.criteriaBluePrints = new Map();
    this.criteriaMetadata = new Map();
  }

  public registerBluePrint(criteria: Scheincriteria) {
    console.group(`Scheincriteria identifier: ${criteria.identifier}`);

    this.criteriaBluePrints.set(criteria.identifier, criteria);

    for (const propertyName of Object.getOwnPropertyNames(criteria)) {
      const metadata = this.getMetadata(criteria, propertyName);

      console.log(propertyName, ':', metadata || 'No metadata saved for this property.');
    }

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

  private getMetadata(
    target: Record<string, any>,
    propertyName: string
  ): ScheincriteriaMetadata | undefined {
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

    return undefined;
  }

  private getKeyAsString(key: ScheincriteriaMetadataKey): string {
    return `${key.className}::${key.propertyName}`;
  }
}

const scheincriteriaService = new ScheincriteriaService();
export default scheincriteriaService;
