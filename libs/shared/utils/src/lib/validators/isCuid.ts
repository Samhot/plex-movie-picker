import {
    ValidationOptions,
    ValidatorConstraint,
    ValidatorConstraintInterface,
    registerDecorator,
} from 'class-validator';

const CODES = {
    a: 97,
    zero: 48,
};

// numerical char codes range from 48 -> 48 + 9
const NUMBERS_CHAR_CODES = Array(10)
    .fill(null)
    .map((_, idx) => idx + CODES.zero);

// lowercase alphabet codes
const LOWERCASE_LETTERS_CHAR_CODES = Array(26)
    .fill(null)
    .map((_, idx) => idx + CODES.a);

const VALID_CUID_CHAR_CODES = [...NUMBERS_CHAR_CODES, ...LOWERCASE_LETTERS_CHAR_CODES];
const containsOnlyValidCuidValues = (val: string): boolean => {
    // remove 'c' char
    const tail = val.substring(1);

    return tail.split('').every((char) => VALID_CUID_CHAR_CODES.includes(char.charCodeAt(0)));
};

export const isCuid = (text: unknown) => {
    return typeof text === 'string' && text.charAt(0) === 'c' && text.length >= 23 && containsOnlyValidCuidValues(text);
};
@ValidatorConstraint({ name: 'is-cuid', async: false })
export class IsCuidConstraint implements ValidatorConstraintInterface {
    validate(text: unknown) {
        return isCuid(text);
    }

    defaultMessage() {
        return '($value) must be a valid cuid';
    }
}

export function IsCuid(options?: ValidationOptions) {
    // eslint-disable-next-line @typescript-eslint/ban-types
    return function (object: Object, propertyName: string) {
        registerDecorator({
            name: 'IsCuid',
            target: object.constructor,
            propertyName: propertyName,
            constraints: [options],
            options: options,
            validator: IsCuidConstraint,
        });
    };
}
