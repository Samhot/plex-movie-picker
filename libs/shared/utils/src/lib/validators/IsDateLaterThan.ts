import { ValidationArguments, ValidationOptions, registerDecorator } from 'class-validator';

export function IsDateLaterThan(property: string, validationOptions?: ValidationOptions) {
    return function (object: Record<string, unknown>, propertyName: string) {
        registerDecorator({
            name: 'IsDateLaterThan',
            target: object.constructor,
            propertyName: propertyName,
            constraints: [property],
            options: validationOptions,
            validator: {
                validate(value: Date, args: ValidationArguments) {
                    const [relatedPropertyName] = args.constraints;
                    const relatedValue = args.object[relatedPropertyName];

                    return isDateLaterThan(value, relatedValue);
                },
            },
        });
    };
}

export const isDateLaterThan = (value?: Date | null, relatedValue?: Date | null) => {
    if (!relatedValue) return !value;

    if (!value) return true;

    return value.getTime() >= relatedValue.getTime();
};
