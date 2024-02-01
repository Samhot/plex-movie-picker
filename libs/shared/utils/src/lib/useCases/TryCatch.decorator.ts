import { ZodError } from 'zod';

import { CoreValidationError } from '../Errors/ValidationError';

export function TryCatch() {
    return (target: { constructor: { name: string } }, propertyKey: string, descriptor: PropertyDescriptor) => {
        const originalMethod = descriptor.value;
        const className = target.constructor.name;

        if (!className) {
            throw new Error('Class name is not defined');
        }

        if (typeof originalMethod !== 'function') {
            throw new Error('Only methods can be decorated with @TryCatch.');
        }

        descriptor.value = async function (...args: unknown[]) {
            try {
                const result = await originalMethod.apply(this, args);

                return result;
            } catch (e) {
                if (e instanceof ZodError) {
                    return {
                        success: null,
                        error: new CoreValidationError(e.message, e.issues),
                    };
                }

                return {
                    success: null,
                    error: e,
                };
            }
        };

        return descriptor;
    };
}
