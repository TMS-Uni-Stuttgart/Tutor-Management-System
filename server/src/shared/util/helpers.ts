import { NamedElement } from '../model/Common';

interface NameOptions {
  firstNameFirst: boolean;
}

export function getNameOfEntity(
  entity: NamedElement,
  { firstNameFirst }: Partial<NameOptions> = {}
): string {
  if (firstNameFirst) {
    return `${entity.firstname} ${entity.lastname}`;
  } else {
    return `${entity.lastname}, ${entity.firstname} `;
  }
}

export function sortByName(a: NamedElement, b: NamedElement): number {
  const nameOfA = getNameOfEntity(a);
  const nameOfB = getNameOfEntity(b);

  return nameOfA.localeCompare(nameOfB);
}
