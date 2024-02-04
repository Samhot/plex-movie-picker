export class CheckError<Type extends string> extends Error {
    constructor(readonly type: Type) {
        super();
    }
}
