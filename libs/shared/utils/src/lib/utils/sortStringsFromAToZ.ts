import { remove as removeDiacritics } from 'remove-accents';

export function sortStringsFromAToZ(stringA: string, stringB: string) {
    const a = removeDiacritics(stringA).trim().toLocaleUpperCase();
    const b = removeDiacritics(stringB).trim().toLocaleUpperCase();

    return a.localeCompare(b);
}
