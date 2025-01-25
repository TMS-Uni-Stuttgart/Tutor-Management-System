import { Collection } from '@mikro-orm/core';

export function updateCollection<T extends { id: string }>(
    collection: Collection<T>,
    updated: T[]
) {
    const currentLookup = new Map(collection.getItems().map((item) => [item.id, item]));
    const updatedLookup = new Map(updated.map((item) => [item.id, item]));
    for (const [id, item] of currentLookup) {
        if (!updatedLookup.has(id)) {
            collection.remove(item);
        }
    }
    for (const item of updated) {
        if (!currentLookup.has(item.id)) {
            collection.add(item);
        }
    }
}
