import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import { ValidationOptions, registerDecorator } from 'class-validator';

import { isMultipleFirebasePushId } from './IsMultipleFirebasePushId';
import { isCuid } from './isCuid';

interface Options extends ValidationOptions {
    firebasePushIdMinCount?: number;
    separator?: string;
    ignoreKeys?: string[];
    customIndex?: number[];
}

@ValidatorConstraint()
class IsCuidOrMultipleFirebasePushIdConstraint implements ValidatorConstraintInterface {
    validate(value: string | undefined, args: ValidationArguments) {
        const options: Options = args.constraints[0] || {};

        return isCuidOrMultipleFirebasePushId(options.firebasePushIdMinCount || 2, {
            separator: options.separator,
            ignoreKeys: options.ignoreKeys,
            customIndex: options.customIndex,
        })(value);
    }

    defaultMessage() {
        return 'Invalid cuid or multiple firebase push id';
    }
}

export function IsCuidOrMultipleFirebasePushId(options?: Options) {
    // eslint-disable-next-line @typescript-eslint/ban-types
    return function (object: Object, propertyName: string) {
        registerDecorator({
            name: 'isCuidOrMultipleFirebasePushId',
            target: object.constructor,
            propertyName: propertyName,
            constraints: [options],
            options: options,
            validator: IsCuidOrMultipleFirebasePushIdConstraint,
        });
    };
}

export const isCuidOrMultipleFirebasePushId =
    (
        firebasePushIdCount = 2,
        additionalParams?: { separator?: string; ignoreKeys?: string[]; customIndex?: number[] }
    ) =>
    (text?: string) => {
        const separator = additionalParams?.separator || '/';
        const ignoreKeys = additionalParams?.ignoreKeys || [];
        const customIndex = additionalParams?.customIndex;
        if (!text || typeof text !== 'string') return false;
        if (isCuid(text)) return true;

        return isMultipleFirebasePushId(firebasePushIdCount, { separator, ignoreKeys, customIndex })(text);
    };
