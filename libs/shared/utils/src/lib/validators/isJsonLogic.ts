import { is_logic } from 'json-logic-js';

export const isJsonLogic = (stringifiedJson?: string) => {
    if (!stringifiedJson) return true;

    try {
        const parsedJson = JSON.parse(stringifiedJson);
        return is_logic(parsedJson);
    } catch (err) {
        return false;
    }
};
