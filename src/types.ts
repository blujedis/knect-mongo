import {
  ObjectId, FindOneOptions, DeleteWriteOpResultObject,
  Db, MongoClient, InsertOneWriteOpResult, FindAndModifyWriteOpResultObject, FilterQuery, CollectionInsertOneOptions, UpdateQuery, UpdateManyOptions, UpdateOneOptions, CommonOptions
} from 'mongodb';

import { IHookHandler } from 'mustad';

import { ObjectSchema } from 'yup';

export type LikeObjectId = string | number | ObjectId;

export type Constructor<T = any> = new (...args: any[]) => T;

export interface ICascadeResult<T = any> {
  doc: T,
  ops: {
    [key: string]: DeleteWriteOpResultObject[];
  }
}

export interface IJoin {
  collection: string;
  key?: string; // defaults to _id
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
  insertId: LikeObjectId,
  ok: number;
  doc: S;
  response: InsertOneWriteOpResult<S> | FindAndModifyWriteOpResultObject<S>;
}

// IFindOneOptions, 
// CollectionInsertOneOptions | CollectionInsertManyOptions 
// UpdateOneOptions | UpdateManyOptions,
// CommonOptions & { bypassDocumentValidation?: boolean }

export interface IPreHook<S> {
  (
    next: IHookHandler,
    queryOrId: LikeObjectId | FilterQuery<S>,
    update: UpdateQuery<Partial<S>> | Partial<S>,
    options?: UpdateOneOptions | UpdateManyOptions,
    ...args: any[]): any;
  (next: IHookHandler, doc: S | S[], options?: CollectionInsertOneOptions, ...args: any[]): any;
  (
    next: IHookHandler, 
    queryOrId: LikeObjectId | FilterQuery<S>, 
    options?: IFindOneOptions | CommonOptions & { bypassDocumentValidation?: boolean },
    ...args: any[]): any;
  (next: IHookHandler, ...args: any[]): any;
}
