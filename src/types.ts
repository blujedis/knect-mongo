import {
  ObjectId, FindOneOptions, DeleteWriteOpResultObject,
  InsertOneWriteOpResult, FindAndModifyWriteOpResultObject, FindOneAndDeleteOption, MongoClientOptions, UpdateQuery
} from 'mongodb';
import { IHookHandler } from 'mustad';
import { initDocument } from './document';
import { string } from 'yup';

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

export type Joins<T> = { [K in keyof T]?: IJoin };

export interface ISchema<T, S = any> {
  collectionName?: string;
  props?: Record<keyof T, S>;
  joins?: Joins<T>;
}

export interface IDoc {
  _id?: LikeObjectId;
}

export interface IFindOneOptions extends FindOneOptions {
  populate?: string | string[];
}

export interface IFindOneAndDeleteOption<T extends IDoc> extends FindOneAndDeleteOption {
  cascade?: boolean | string | string[] | Joins<T>;
}

export interface IModelSaveResult<T extends IDoc> {
  insertId: LikeObjectId,
  ok: number;
  doc: T;
  response: InsertOneWriteOpResult<T & { _id: any; }> | FindAndModifyWriteOpResultObject<T>;
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
  isValid?<T, S = any>(ns: string, doc: T, schema: ISchema<T, S>): Promise<boolean>;

  /**
   * Tests if the document is valid and returns ValidationError when false.
   * 
   * @param ns the namespace being validated.
   * @param doc the document to be validated.
   * @param schema the schema the model was initiated with.
   */
  validate?<T, S = any>(ns: string, doc: T, schema: ISchema<T, S>): Promise<T>;

  /**
   * Handler when soft deletes are made.
   * True = sets property "deleted" with epoch timestamp.
   * String = sets property by this name with epoch timestamp.
   * If using handler function update and return the document.
   * 
   * @default true
   */
  onSoftDelete?: true | string |
  (<T extends IDoc>(update: Partial<T>) => Partial<T>);

}
