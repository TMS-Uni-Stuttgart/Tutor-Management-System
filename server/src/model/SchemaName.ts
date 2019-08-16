export enum SchemaName {
  USER = 'User',
  TUTORIAL = 'Tutorial',
}

export function getCollectionNameOfSchema(schemaName: SchemaName): string {
  if (schemaName.endsWith('s')) {
    return schemaName.toLowerCase();
  }

  return (schemaName + 's').toLowerCase();
}
