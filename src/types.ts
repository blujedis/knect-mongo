import {
  ObjectId, FindOneOptions, DeleteWriteOpResultObject,
  InsertOneWriteOpResult, FindAndModifyWriteOpResultObject, FindOneAndDeleteOption
} from 'mongodb';

import { IHookHandler } from 'mustad';
import { ObjectSchema } from 'yup';
import { initDocument } from './document';

const DocumentModel = (false as true) && initDocument();
export type DerivedDocument = typeof DocumentModel;

export type KeyOf<T> = Extract<keyof T, string>;

export type LikeObjectId = string | number | ObjectId;

export type Constructor<T = any> = new (...args: any[]) => T;

export interface ICascadeResult<T = any> {
  doc: T,
  ops: {
    [key: string]: DeleteWriteOpResultObject[];
  };
}

export interface IJoin {
  collection: string;
  key?: string; // defaults to _id
  options?: FindOneOptions;
  cascade?: boolean;
}

export type Joins<S> = { [K in keyof S]: IJoin };

export interface ISchema<S extends object> {
  collectionName?: string;
  props?: ObjectSchema<S>;
  joins?: Joins<S>;
}

export interface IDoc {
  _id?: LikeObjectId;
}

export interface IFindOneOptions extends FindOneOptions {
  populate?: string | string[];
}

export interface IFindOneAndDeleteOption<S extends IDoc> extends FindOneAndDeleteOption {
  cascade?: boolean | string | string[] | Joins<S>;
}

export interface IModelSaveResult<S extends IDoc> {
  insertId: LikeObjectId,
  ok: number;
  doc: S;
  response: InsertOneWriteOpResult<S & { _id: any; }> | FindAndModifyWriteOpResultObject<S>;
}

export type DocumentHook<A1 = any, A2 = any, A3 = any> =
  (next: IHookHandler, arg1?: A1, arg2?: A2, arg3?: A3, ...args: any[]) => any;
