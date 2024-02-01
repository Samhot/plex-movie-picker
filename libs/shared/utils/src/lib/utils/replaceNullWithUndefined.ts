/* eslint-disable @typescript-eslint/no-explicit-any */
type RecursivelyReplaceNullWithUndefined<T> = T extends null
    ? undefined // Note: Add interfaces here of all GraphQL scalars that will be transformed into an object
    : T extends Date
    ? T
    : {
          [K in keyof T]: T[K] extends (infer U)[]
              ? RecursivelyReplaceNullWithUndefined<U>[]
              : RecursivelyReplaceNullWithUndefined<T[K]>;
      };

/**
 * Recursively replaces all nulls with undefineds.
 * Skips object classes (that have a `.__proto__.constructor`).
 *
 * Unfortunately, until https://github.com/apollographql/apollo-client/issues/2412
 * gets solved at some point,
 * this is the only workaround to prevent `null`s going into the codebase,
 * if it's connected to a Apollo server/client.
 */
// eslint-disable-next-line @typescript-eslint/ban-types
export function replaceNullWithUndefined<T extends Object | undefined>(obj: T): RecursivelyReplaceNullWithUndefined<T> {
    if (obj === null) return undefined as RecursivelyReplaceNullWithUndefined<T>;
    if (obj instanceof Date || typeof obj === 'string' || typeof obj === 'boolean' || typeof obj === 'number')
        return obj as any;
    if (Array.isArray(obj)) return obj.map((v) => replaceNullWithUndefined(v)) as any;

    const newObj: any = obj ? { ...obj } : {};
    Object.keys(obj ?? {}).forEach((k) => {
        const v: any = (obj as any)[k];
        newObj[k as keyof T] =
            v === null
                ? undefined
                : // eslint-disable-next-line no-proto
                v && typeof v === 'object'
                ? replaceNullWithUndefined(v)
                : v;
    });

    return newObj;
}
