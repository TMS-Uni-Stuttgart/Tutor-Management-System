import { Entity, PrimaryKey, Property } from '@mikro-orm/core';
import { v4 } from 'uuid';

@Entity()
export class Scheincriteria {
    @PrimaryKey()
    id = v4();

    @Property()
    name: string;

    // TODO: How to handle this one? -- JSON???
    @Property()
    criteria: Scheincriteria;

    constructor(params: ScheincriteriaParams) {
        this.name = params.name;
        this.criteria = params.criteria;
    }
}

interface ScheincriteriaParams {
    name: string;
    criteria: Scheincriteria;
}
