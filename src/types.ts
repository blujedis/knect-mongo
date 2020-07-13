import {
  ObjectId, FindOneOptions, DeleteWriteOpResultObject,
  InsertOneWriteOpResult, FindAndModifyWriteOpResultObject, FindOneAndDeleteOption, MongoClientOptions, UpdateQuery
} from 'mongodb';
import { IHookHandler } from 'mustad';
import { initDocument } from './document';
import { number } from 'yup';

const DocumentModel = (false as true) && initDocument();

export interface IMap<T = any> {
  [key: string]: T;
}

export type ObjectType<T = any> = Record<keyof T, T[keyof T]>;

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

export interface ISchema<S> {
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

export type HookType = 'find' | 'create' | 'update' | 'delete';

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
   * @param schema the schema the model was initiated with.
   */
  isValid?<S>(ns: string, doc: S, schema: ISchema<S>): Promise<boolean>;

  /**
   * Tests if the document is valid and returns ValidationError when false.
   * 
   * @param ns the namespace being validated.
   * @param doc the document to be validated.
   * @param schema the schema the model was initiated with.
   */
  validate?<S>(ns: string, doc: S, schema: ISchema<S>): Promise<S>;

  /**
   * Handler when soft deletes are made.
   * True = sets property "deleted" with epoch timestamp.
   * String = sets property by this name with epoch timestamp.
   * If using handler function update and return the document.
   * 
   * @default true
   */
  onSoftDelete?: true | string |
  (<S extends IDoc>(update: Partial<S>) => Partial<S>);

}
