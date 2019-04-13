import { FilterQuery, UpdateQuery } from 'mongodb';
export declare type HookHandler<T = any> = (context: IHookContext<T>) => Promise<IHookContext<T>>;
export declare type Constructor<T> = new (...args: any[]) => T;
export declare type HookTypes = keyof IHookConfig;
export interface IHookContext<T = any> {
    filter?: FilterQuery<T>;
    doc?: T | T[];
    update?: UpdateQuery<T> | T;
    options?: any;
}
export interface IHookConfig {
    pre?: HookHandler;
    post?: HookHandler;
}
export interface IHooks {
    [key: string]: IHookConfig;
}
export declare type AwaiterResponse<T = any, K extends string = 'data'> = Promise<{
    err?: Error;
} & Record<K, T>>;
