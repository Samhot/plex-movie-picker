import {
    ValidationArguments,
    ValidatorConstraint,
    ValidatorConstraintInterface,
    isFirebasePushId,
} from 'class-validator';
import { ValidationOptions, registerDecorator } from 'class-validator';

import { isCustomFirebasePushId } from './isCuidOrCustomFirebasePushId';

interface Options extends ValidationOptions {
    firebasePushIdMinCount?: number;
    separator?: string;
}

@ValidatorConstraint()
class IsMultipleFirebasePushIdConstraint implements ValidatorConstraintInterface {
    validate(value: string | undefined, args: ValidationArguments) {
        const options: Options = args.constraints[0] || {};

        return isMultipleFirebasePushId(options.firebasePushIdMinCount ?? 2, { separator: options.separator })(value);
    }
}

export function IsMultipleFirebasePushId(options?: Options) {
    // eslint-disable-next-line @typescript-eslint/ban-types
    return function (object: Object, propertyName: string) {
        registerDecorator({
            name: 'IsMultipleFirebasePushId',
            target: object.constructor,
            propertyName: propertyName,
            constraints: [options],
            options: options,
            validator: IsMultipleFirebasePushIdConstraint,
        });
    };
}

type Decrement = [never, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
type RepeatString<S extends string, N extends number, Separator extends string> = N extends 1
    ? S
    : `${S}${Separator}${RepeatString<S, Decrement[N], Separator>}`;

export const isMultipleFirebasePushId =
    <Count extends number, Separator extends string>(
        firebasePushIdCount: Count,
        additionalParams?: { separator?: Separator; ignoreKeys?: string[]; customIndex?: number[] }
    ) =>
    (text?: string): text is RepeatString<string, Count, '/'> => {
        if (!text) return false;

        const split = text.split(additionalParams?.separator ?? '/');
        const keys = additionalParams?.ignoreKeys
            ? split.filter((v) => !additionalParams.ignoreKeys?.includes(v))
            : split;

        return (
            keys.length >= firebasePushIdCount &&
            keys.every(
                (item, index) =>
                    (additionalParams?.customIndex?.includes(index)
                        ? isCustomFirebasePushId(item)
                        : isFirebasePushId(item)) || additionalParams?.ignoreKeys?.includes(item)
            )
        );
    };
