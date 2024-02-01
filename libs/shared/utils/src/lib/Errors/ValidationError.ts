import { ZodIssue } from 'zod';

export class CoreValidationError extends Error {
    constructor(message: string, issues: ZodIssue[], data?: Record<string, unknown>) {
        super('ValidationError : ' + message);
        this.name = 'ValidationError';

        const errors = {};
        issues.forEach((issue) => {
            errors[issue.path.join('/')] = issue.message;
        });

        this.errors = errors;
        this.data = data;
    }

    errors: Record<string, string>;
    data?: Record<string, unknown>;
}
