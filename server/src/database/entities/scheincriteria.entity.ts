import { Entity, PrimaryKey, Property } from '@mikro-orm/core';
import { IScheinCriteria } from 'shared/model/ScheinCriteria';
import { v4 } from 'uuid';
import { Scheincriteria } from '../../module/scheincriteria/container/Scheincriteria';

@Entity()
export class ScheincriteriaEntity {
    @PrimaryKey()
    id = v4();

    @Property()
    name: string;

    @Property({ type: 'json' })
    criteria: Scheincriteria;

    constructor(params: ScheincriteriaParams) {
        this.name = params.name;
        this.criteria = params.criteria;
    }

    toDTO(): IScheinCriteria {
        const data: IScheinCriteria['data'] = {};

        for (const key in JSON.parse(JSON.stringify(this.criteria))) {
            if (key !== 'identifier') {
                data[key] = (this.criteria as any)[key];
            }
        }

        return {
            id: this.id,
            identifier: this.criteria.identifier,
            name: this.name,
            data,
        };
    }
}

interface ScheincriteriaParams {
    name: string;
    criteria: Scheincriteria;
}
