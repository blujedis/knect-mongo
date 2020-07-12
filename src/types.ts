import {
  ObjectId, FindOneOptions, DeleteWriteOpResultObject,
  InsertOneWriteOpResult, FindAndModifyWriteOpResultObject, FindOneAndDeleteOption, MongoClientOptions
} from 'mongodb';
import { IHookHandler } from 'mustad';
import { initDocument } from './document';
import { ValidationError } from './error';
// import { ObjectSchema } from 'yup';

const DocumentModel = (false as true) && initDocument();

export interface IMap<T = any> {
  [key: string]: T;
}

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

export interface ISchema<S extends {}> {
  collectionName?: string;
  joins?: Joins<Partial<S>>;
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

export interface IOptions {

  /**
   * The connections string to connect to MongoDB.
   */
  uri?: string;

  /**
   * Mongodb client connection options.
   */
  clientOptions?: MongoClientOptions;

  /**
   * The namespace delimiter 
   * 
   * @default .
   */
  delimiter?: string;

  /**
   * Tests if the document is valid.
   * 
   * @param ns the namespace being validated.
   * @param doc the document to be validated.
   */
  isValid?<S extends {}>(ns: string, doc: S): Promise<boolean>;

  /**
   * Tests if the document is valid and returns ValidationError when false.
   * 
   * @param ns the namespace being validated.
   * @param doc the document to be validated.
   */
  validate?<S extends {}>(ns: string, doc: S): Promise<S>;

}
