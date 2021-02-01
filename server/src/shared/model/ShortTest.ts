import { IRatedEntity, IRatedEntityDTO } from './RatedEntity';

export interface IShortTest extends IRatedEntity {
    shortTestNo: number;
}

export interface IShortTestDTO extends IRatedEntityDTO {
    shortTestNo: number;
}
