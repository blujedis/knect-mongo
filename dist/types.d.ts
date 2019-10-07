import { ObjectId, FindOneOptions, DeleteWriteOpResultObject, InsertOneWriteOpResult, FindAndModifyWriteOpResultObject } from 'mongodb';
import { IHookHandler } from 'mustad';
import { ObjectSchema } from 'yup';
export declare type LikeObjectId = string | number | ObjectId;
export declare type Constructor<T = any> = new (...args: any[]) => T;
export interface ICascadeResult<T = any> {
    doc: T;
    ops: {
        [key: string]: DeleteWriteOpResultObject[];
    };
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
export interface ISchema<T extends object> {
    collectionName?: string;
    props?: ObjectSchema<T>;
    joins?: IJoins;
}
export interface IDoc {
    _id?: ObjectId;
}
export interface IFindOneOptions extends FindOneOptions {
    populate?: string | string[];
}
export interface IModelSaveResult<S extends IDoc> {
    insertId: LikeObjectId;
    ok: number;
    doc: S;
    response: InsertOneWriteOpResult<S> | FindAndModifyWriteOpResultObject<S>;
}
export declare type DocumentHook<A1 = any, A2 = any, A3 = any> = (next: IHookHandler, arg1?: A1, arg2?: A2, arg3?: A3, ...args: any[]) => any;
