export interface IExecutionContextStorage {
    get<T>(key: string): T;
    getAll(): Record<symbol, unknown>;
    set<T>(key: string, value: T): void;
    getContextId(): string;
    getUserId(): string;
}
