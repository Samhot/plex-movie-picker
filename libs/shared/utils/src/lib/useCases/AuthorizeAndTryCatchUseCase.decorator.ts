import { ExecuteUseCase } from './ExecuteUseCase.decorator';

export function AuthorizeAndTryCatchUseCase() {
    return (
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        target: { constructor: { name: string }; authorize: (...args: any[]) => Promise<boolean> | boolean },
        propertyKey: string,
        descriptor: PropertyDescriptor
    ) => {
        ExecuteUseCase({ checkAuthorization: true, tryCatchAndLog: true })(target, propertyKey, descriptor);
    };
}
