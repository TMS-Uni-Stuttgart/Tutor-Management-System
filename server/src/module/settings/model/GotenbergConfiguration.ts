import { IsNumber, IsString, Min } from 'class-validator';

export class GotenbergConfiguration {
    @IsString()
    readonly host!: string;

    @IsNumber({}, { always: true })
    @Min(0)
    readonly timeout!: number;

    @IsNumber({}, { always: true })
    @Min(0)
    readonly port!: number;
}
