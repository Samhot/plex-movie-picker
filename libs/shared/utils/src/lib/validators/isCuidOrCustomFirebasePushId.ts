import { isFirebasePushId } from 'class-validator';

import { isCuid } from './isCuid';

export const isCustomFirebasePushId = (text: string) => {
    if (isFirebasePushId(text)) return true;

    return text.length === 27 && isFirebasePushId(text.slice(0, 20)) && text.endsWith('_custom');
};

export const isCuidOrCustomFirebasePushId = (text?: unknown) => {
    if (!text || typeof text !== 'string') return false;
    if (isCuid(text)) return true;

    return isCustomFirebasePushId(text);
};
