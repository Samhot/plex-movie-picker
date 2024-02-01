export const isDefined = <T>(element: T | null | undefined): element is T => element !== null && element !== undefined;

// eslint-disable-next-line @typescript-eslint/ban-types
export const partialize = <T extends Object>(obj: T, nullsIncluded = false): T => {
    Object.keys(obj).forEach((key) => {
        if (obj[key] === undefined || (nullsIncluded && obj[key] === null)) {
            delete obj[key];
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
            return partialize(obj[key]);
        }
    });

    return obj;
};
