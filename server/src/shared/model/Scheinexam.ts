import { IRatedEntity, IRatedEntityDTO } from './RatedEntity';

export interface IScheinExam extends IRatedEntity {
  date: string;
  scheinExamNo: number;
}

export interface IScheinexamDTO extends IRatedEntityDTO {
  date: string;
  scheinExamNo: number;
}
