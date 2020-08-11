import { IRatedEntity, IRatedEntityDTO } from './RatedEntity';

export interface IShortTest extends IRatedEntity {
  shortTestNo: string;
}

export interface IShortTestDTO extends IRatedEntityDTO {
  shortTestNo: string;
}
