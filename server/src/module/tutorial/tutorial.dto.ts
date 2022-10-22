import { BadRequestException } from '@nestjs/common';
import { Type } from 'class-transformer';
import {
    IsArray,
    IsEnum,
    IsUUID,
    IsNumber,
    IsOptional,
    IsString,
    Min,
    ValidateNested,
} from 'class-validator';
import { DateTime, Interval } from 'luxon';
import { IsLuxonDateTime, IsLuxonInterval } from '../../helpers/validators/luxon.validator';
import {
    IExcludedDate,
    ISubstituteDTO,
    ITutorialDTO,
    ITutorialGenerationData,
    ITutorialGenerationDTO,
    Weekday,
} from 'shared/model/Tutorial';

export class TutorialDTO implements ITutorialDTO {
    @IsString()
    slot!: string;

    @IsOptional()
    @IsString()
    tutorId?: string;

    @IsLuxonDateTime()
    startTime!: string;

    @IsLuxonDateTime()
    endTime!: string;

    @IsArray()
    @IsLuxonDateTime({ each: true })
    dates!: string[];

    @IsArray()
    @IsString({ each: true })
    correctorIds!: string[];
}

export class SubstituteDTO implements ISubstituteDTO {
    @IsOptional()
    @IsUUID()
    tutorId?: string;

    @IsArray()
    @IsLuxonDateTime({ each: true })
    dates!: string[];
}

export class ExcludedTutorialDate implements IExcludedDate {
    @IsOptional()
    @IsLuxonDateTime()
    date?: string;

    @IsOptional()
    @IsLuxonInterval()
    interval?: string;

    getDates(): DateTime[] {
        if (!!this.date) {
            return [DateTime.fromISO(this.date)];
        }

        if (!!this.interval) {
            return Interval.fromISO(this.interval)
                .splitBy({ days: 1 })
                .map((i) => i.start.startOf('day'));
        }

        throw new BadRequestException(
            'The ExcludedTutorialDate object does neither contain a date nor an interval property.'
        );
    }
}

export class TutorialGenerationData implements ITutorialGenerationData {
    @IsString()
    prefix!: string;

    @IsEnum(Weekday)
    weekday!: Weekday;

    @IsNumber()
    @Min(1)
    amount!: number;

    @IsLuxonInterval()
    interval!: string;

    getInterval(): Interval {
        return Interval.fromISO(this.interval);
    }
}

export class TutorialGenerationDTO implements ITutorialGenerationDTO {
    @IsLuxonDateTime()
    firstDay!: string;

    @IsLuxonDateTime()
    lastDay!: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ExcludedTutorialDate)
    excludedDates!: ExcludedTutorialDate[];

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => TutorialGenerationData)
    generationDatas!: TutorialGenerationData[];

    getFirstDay(): DateTime {
        return DateTime.fromISO(this.firstDay);
    }

    getLastDay(): DateTime {
        return DateTime.fromISO(this.lastDay);
    }
}
