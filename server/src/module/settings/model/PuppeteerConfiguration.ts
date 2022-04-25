import { IsNumber, Min } from 'class-validator';

export class PuppeteerConfiguration {
    // @IsOptional()
    @IsNumber({}, { always: true })
    @Min(0)
    readonly timeout!: number;
}
