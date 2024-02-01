import { AuthorizationError } from '../Errors/AuthorizationError';

export function Authorize() {
    return (
        target: { constructor: { name: string }; authorize: (...args: unknown[]) => Promise<boolean> | boolean },
        _: string,
        descriptor: PropertyDescriptor
    ) => {
        const originalMethod = descriptor.value;

        if (typeof originalMethod !== 'function') {
            throw new Error('Only methods can be decorated with @Authorize.');
        }

        descriptor.value = async function (...args: unknown[]) {
            if (!(await target.authorize.apply(this, args))) {
                throw new AuthorizationError('Unauthorized');
            }

            const result = await originalMethod.apply(this, args);

            return result;
        };

        return descriptor;
    };
}
