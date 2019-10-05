import { FilterQuery, UpdateQuery, ObjectID, FindOneOptions, DeleteWriteOpResultObject, Db, MongoClient, InsertWriteOpResult, InsertOneWriteOpResult } from 'mongodb';
import { ObjectSchema } from 'yup';
export declare type LikeObjectID = string | number | ObjectID;
export declare type HookHandler<T = any> = (context: IHookContext<T>) => Promise<IHookContext<T>>;
export declare type HookTypes = keyof IHookConfig;
export declare type Constructor<T = any> = new (...args: any[]) => T;
export interface ICascadeResult<T = any> {
    doc: T;
    ops: {
        [key: string]: DeleteWriteOpResultObject[];
    };
}
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
export interface IBaseProps {
    created?: number;
    modified?: number;
    deleted?: number;
}
export interface IJoin {
    collection: string;
    key?: string;
    options?: FindOneOptions;
    cascade?: boolean;
}
export interface IJoins {
    [key: string]: IJoin;
}
export interface ISchema<T extends object = any> {
    collectionName?: string;
    props?: ObjectSchema<T>;
    joins?: IJoins;
}
export interface ISchemas {
    [key: string]: ISchema;
}
export interface IFindOneOptions extends FindOneOptions {
    populate?: string | string[];
}
export interface IInsertWriteOpResult<T> extends InsertWriteOpResult {
    ops: T[];
}
export interface IInsertOneWriteOpResult<T> extends InsertOneWriteOpResult {
    ops: T[];
}
export { Db, MongoClient };
