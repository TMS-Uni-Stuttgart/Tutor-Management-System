import { ExercisePointsInfo, IExercisePointsInfo } from 'shared/model/Gradings';
import { IExercise, ISubexercise } from 'shared/model/HasExercises';
import { DocumentType, mongoose, prop } from '@typegoose/typegoose';
import { generateObjectId } from '../../helpers/generateObjectId';
import { ExerciseDTO, SubExerciseDTO } from '../../module/sheet/sheet.dto';

export interface HandInDocument {
    id?: string;
    exercises: ExerciseDocument[];
}

interface SubExerciseConstructorFields {
    id?: string;
    exName: string;
    bonus: boolean;
    maxPoints: number;
}

interface ExerciseConstructorFields extends SubExerciseConstructorFields {
    subexercises?: SubExerciseModel[];
}

export class SubExerciseModel {
    constructor(fields: SubExerciseConstructorFields) {
        const { id, ...rest } = fields;

        Object.assign(this, rest);
        this._id = new mongoose.Types.ObjectId(id ?? generateObjectId());
    }

    @prop()
    _id: mongoose.Types.ObjectId;

    get id(): string {
        return this._id.toHexString();
    }

    @prop({ required: true })
    exName!: string;

    @prop({ required: true })
    bonus!: boolean;

    @prop({ required: true })
    maxPoints!: number;

    get pointInfo(): ExercisePointsInfo {
        return new ExercisePointsInfo({
            must: this.bonus ? 0 : this.maxPoints,
            bonus: this.bonus ? this.maxPoints : 0,
        });
    }

    static fromDTO(dto: SubExerciseDTO): SubExerciseModel {
        return new SubExerciseModel({ ...dto });
    }

    toDTO(this: SubExerciseDocument): ISubexercise {
        return {
            id: this.id,
            bonus: this.bonus,
            exName: this.exName,
            maxPoints: this.maxPoints,
        };
    }
}

export class ExerciseModel {
    constructor(fields: ExerciseConstructorFields) {
        this.exName = fields.exName;
        this.bonus = fields.bonus;
        this._maxPoints = fields.maxPoints;
        this.subexercises = (fields.subexercises as SubExerciseDocument[]) ?? [];

        this._id = new mongoose.Types.ObjectId(fields.id ?? generateObjectId());
    }

    @prop()
    _id: mongoose.Types.ObjectId;

    get id(): string {
        return this._id.toHexString();
    }

    @prop({ required: true })
    exName!: string;

    @prop({ required: true })
    bonus!: boolean;

    @prop({ required: true })
    private _maxPoints!: number;

    get maxPoints(): number {
        if (!!this.subexercises && this.subexercises.length > 0) {
            return this.subexercises.reduce((sum, current) => sum + current.maxPoints, 0);
        } else {
            return this._maxPoints;
        }
    }

    set maxPoints(points: number) {
        this._maxPoints = points;
    }

    get pointInfo(): ExercisePointsInfo {
        if (this.subexercises.length === 0) {
            return new ExercisePointsInfo({
                must: this.bonus ? 0 : this.maxPoints,
                bonus: this.bonus ? this.maxPoints : 0,
            });
        }

        const info: IExercisePointsInfo = this.subexercises.reduce(
            (prev, current) => {
                if (current.bonus) {
                    return { ...prev, bonus: current.maxPoints + prev.bonus };
                } else {
                    return { ...prev, must: current.maxPoints + prev.must };
                }
            },
            { must: 0, bonus: 0 }
        );
        return new ExercisePointsInfo(info);
    }

    @prop({ default: [], type: SubExerciseModel })
    subexercises!: SubExerciseDocument[];

    static fromDTO(dto: ExerciseDTO): ExerciseModel {
        const { exName, bonus, maxPoints, subexercises, id } = dto;
        const subExModels = subexercises?.map((sub) => SubExerciseModel.fromDTO(sub));

        return new ExerciseModel({
            id,
            exName,
            bonus,
            maxPoints,
            subexercises: subExModels ?? [],
        });
    }

    toDTO(this: ExerciseDocument): IExercise {
        return {
            id: this.id,
            bonus: this.bonus,
            exName: this.exName,
            maxPoints: this.maxPoints,
            subexercises: this.subexercises.map((ex) => ex.toDTO()),
        };
    }
}

export type ExerciseDocument = DocumentType<ExerciseModel>;
export type SubExerciseDocument = DocumentType<SubExerciseModel>;
