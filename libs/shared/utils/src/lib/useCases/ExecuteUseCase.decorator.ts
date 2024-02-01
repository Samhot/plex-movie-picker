import { Authorize } from './Authorize.decorator';
import { TryCatch } from './TryCatch.decorator';

export function ExecuteUseCase(
    { checkAuthorization, tryCatchAndLog } = {
        checkAuthorization: false,
        tryCatchAndLog: false,
    }
) {
    return (
        target: { constructor: { name: string }; authorize?: (...args: unknown[]) => Promise<boolean> | boolean },
        propertyKey: string,
        descriptor: PropertyDescriptor
    ) => {
        if (checkAuthorization && target.authorize && tryCatchAndLog) {
            return TryCatch()(
                target,
                propertyKey,
                Authorize()({ ...target, authorize: target.authorize }, propertyKey, descriptor)
            );
        }

        if (tryCatchAndLog) {
            return TryCatch()(target, propertyKey, descriptor);
        }

        if (checkAuthorization && target.authorize) {
            return Authorize()({ ...target, authorize: target.authorize }, propertyKey, descriptor);
        }

        return;
    };
}
