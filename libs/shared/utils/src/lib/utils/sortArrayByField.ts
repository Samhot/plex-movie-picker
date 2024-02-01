import { SortDirection } from '../types/SortDirection';

import { sortStringsFromAToZ } from './sortStringsFromAToZ';

export const sortArrayByField = <T extends Record<string, unknown>>(
    objects: T[],
    field: keyof T,
    direction: SortDirection
) => {
    const sortedObjects = [...objects].sort((a, b) => {
        const aValue = a[field] instanceof Date ? (a[field] as Date).getTime() : a[field];
        const bValue = b[field] instanceof Date ? (b[field] as Date).getTime() : b[field];

        if (aValue === null) {
            return SortDirection.ASC ? 1 : -1;
        }
        if (bValue === null) {
            return SortDirection.ASC ? -1 : 1;
        }

        if (
            (typeof aValue !== 'number' && typeof aValue !== 'string') ||
            (typeof bValue !== 'string' && typeof bValue !== 'number')
        ) {
            throw new Error('sortArrayByField only works with strings, numbers and dates');
        }

        if (aValue === bValue) {
            return 0;
        }

        const isBGreaterThanA =
            typeof aValue === 'string' && typeof bValue === 'string'
                ? sortStringsFromAToZ(aValue, bValue)
                : aValue < bValue;

        if (isBGreaterThanA) {
            return direction === SortDirection.ASC ? -1 : 1;
        }

        return direction === SortDirection.ASC ? 1 : -1;
    });

    return sortedObjects;
};
