import { NamedElement } from '../model/Common';

interface NameOptions {
  lastNameFirst: boolean;
}

export function getNameOfEntity(entity: NamedElement, options: Partial<NameOptions> = {}): string {
  if (options.lastNameFirst) {
    return `${entity.lastname}, ${entity.firstname} `;
  } else {
    return `${entity.firstname} ${entity.lastname}`;
  }
}

export function sortByName(a: NamedElement, b: NamedElement): number {
  const nameOfA = getNameOfEntity(a, { lastNameFirst: true });
  const nameOfB = getNameOfEntity(b, { lastNameFirst: true });

  return nameOfA.localeCompare(nameOfB);
}
