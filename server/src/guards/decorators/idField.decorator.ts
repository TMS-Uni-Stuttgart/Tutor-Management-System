import { CustomDecorator, SetMetadata } from '@nestjs/common';

export const ID_FIELD_METADATA_KEY = 'idField';

export const IDField = (fieldName: string): CustomDecorator<string> =>
    SetMetadata(ID_FIELD_METADATA_KEY, fieldName);
