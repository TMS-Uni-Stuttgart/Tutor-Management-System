interface NameOptions {
    firstNameFirst: boolean;
}

interface HasName {
    firstname: string;
    lastname: string;
}

export function getNameOfEntity(
    entity: HasName,
    { firstNameFirst }: Partial<NameOptions> = {}
): string {
    if (firstNameFirst) {
        return `${entity.firstname} ${entity.lastname}`;
    } else {
        return `${entity.lastname}, ${entity.firstname}`;
    }
}

export function sortByName(a: HasName, b: HasName): number {
    const nameOfA = getNameOfEntity(a);
    const nameOfB = getNameOfEntity(b);

    return nameOfA.localeCompare(nameOfB);
}
