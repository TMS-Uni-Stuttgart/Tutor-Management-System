import { ArgumentMetadata, Injectable, ValidationPipe } from '@nestjs/common';
import { plainToClass } from 'class-transformer';

/**
 * Takes in the body of the request (or parts of the body) and transforms it using `class-transformer`.
 * With this pipe in place the REST controllers can use the actual classes and the functions will get properly instantiated objects.
 */
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
