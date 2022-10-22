import { IsNumber, Min } from 'class-validator';

export class PuppeteerConfiguration {
    @IsNumber({}, { always: true })
    @Min(0)
    readonly timeout!: number;
}
