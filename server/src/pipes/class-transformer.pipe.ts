import { ArgumentMetadata, Injectable, ValidationPipe } from '@nestjs/common';
import { plainToClass } from 'class-transformer';

@Injectable()
export class ClassTransformerPipe extends ValidationPipe {
  async transform(value: any, metadata: ArgumentMetadata) {
    await super.transform(value, metadata);

    if (typeof value === 'object' && !!metadata.metatype) {
      return plainToClass(metadata.metatype, value);
    }

    return value;
  }
}
