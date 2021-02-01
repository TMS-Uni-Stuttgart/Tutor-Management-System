import { IExercise, IExerciseDTO, IHasExercises } from './HasExercises';

export interface ISheet extends IHasExercises {
    bonusSheet: boolean;
    exercises: IExercise[];
    sheetNo: number;
}

export interface ISheetDTO {
    bonusSheet: boolean;
    exercises: IExerciseDTO[];
    sheetNo: number;
}
