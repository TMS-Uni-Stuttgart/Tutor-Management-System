import { ArgumentMetadata, Injectable, ValidationPipe } from '@nestjs/common';
import { plainToClass } from 'class-transformer';

@Injectable()
export class ClassTransformerPipe extends ValidationPipe {
    async transform(value: unknown, metadata: ArgumentMetadata): Promise<any> {
        await super.transform(value, metadata);

        if (typeof value === 'object' && !!metadata.metatype) {
            return plainToClass(metadata.metatype, value);
        }

        return value;
    }
}
