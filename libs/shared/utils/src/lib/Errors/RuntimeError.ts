export class RuntimeError extends Error {
    constructor(message: string, data?: Record<string, unknown>) {
        super(message);
        this.name = 'RuntimeError';
        this.data = data;
    }

    data?: Record<string, unknown>;
}

export type Try<T> = [err: Error | null, res: T | null];
