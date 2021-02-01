export class ScheincriteriaMetadataKey {
    constructor(readonly className: string, readonly propertyName: string) {}

    toString(): string {
        return `${this.className}::${this.propertyName}`;
    }
}

interface ScheincriteriaBaseMetadata {
    type: string;
}

interface ScheincriteriaEmptyMetadata extends ScheincriteriaBaseMetadata {
    type: 'empty';
}

interface ScheincriteriaIgnoreMetadata extends ScheincriteriaBaseMetadata {
    type: 'ignore';
}

interface ScheincriteriaNumberMetadata extends ScheincriteriaBaseMetadata {
    type: 'int' | 'float';
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

interface ScheincriteriaEnumMetadata extends ScheincriteriaBaseMetadata {
    type: 'enum';
    enumEntries: string[];
}

export type ScheincriteriaMetadata =
    | ScheincriteriaEmptyMetadata
    | ScheincriteriaIgnoreMetadata
    | ScheincriteriaNumberMetadata
    | ScheincriteriaPercentageMetadata
    | ScheincriteriaPossiblePercentageMetadata
    | ScheincriteriaEnumMetadata;
