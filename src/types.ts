import {
  ObjectId, FindOneOptions, DeleteWriteOpResultObject,
  InsertOneWriteOpResult, FindAndModifyWriteOpResultObject, FindOneAndDeleteOption, MongoClientOptions, FilterQuery
} from 'mongodb';
import { IHookHandler } from 'mustad';
import { initDocument } from './document';

const DocumentModel = (false as true) && initDocument();

export interface IMap<T = any> {
  [key: string]: T;
}

export type ObjectType<T = any> = Record<keyof T, T[keyof T]>;

export type DerivedDocument = typeof DocumentModel;

export type DerivedDocument2<T> = typeof DocumentModel & T;

export type LikeObjectId = string | number | ObjectId;

export type Constructor<T = any> = new (...args: any[]) => T;

export interface ICascadeResult<T = any> {
  doc: T,
  ops: {
    [key: string]: DeleteWriteOpResultObject[];
  };
}

export interface IJoin<T> {
  collection: string;
  key?: keyof T; // defaults to _id
  options?: FindOneOptions<T>;
  cascade?: boolean;
}

export type Joins<T extends IDoc> = { [K in keyof T]?: IJoin<T> };

export interface ISchema<T> {
  collectionName?: string;
  props?: Record<keyof T, T[keyof T]>;
  joins?: Joins<T>;
}

export interface IDoc {
  _id?: LikeObjectId;
}

export interface IFindOneOptions<T> extends FindOneOptions<T> {
  populate?: string | string[];
}

// export type FilterQueryExt<T> = FilterQuery<T> & { $populate: boolean | string | string[] };

export interface IFindOneAndDeleteOption<T extends IDoc> extends FindOneAndDeleteOption<T> {
  cascade?: boolean | string | string[] | Joins<T>;
}

export interface IModelSaveResult<T extends IDoc> {
  insertId: LikeObjectId,
  ok: number;
  doc: T;
  response: InsertOneWriteOpResult<T & { _id: any; }> | FindAndModifyWriteOpResultObject<T>;
}

export type HookType = 'find' | 'create' | 'update' | 'delete' | 'exclude';

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
  isValid?<T>(ns: string, doc: T, schema: ISchema<T>): Promise<boolean>;

  /**
   * Tests if the document is valid and returns ValidationError when false.
   * 
   * @param ns the namespace being validated.
   * @param doc the document to be validated.
   * @param schema the schema the model was initiated with.
   */
  validate?<T>(ns: string, doc: T, schema: ISchema<T>): Promise<T>;

  /**
   * The key to use when using exclude, excludeOne etc..
   * This allows for simple soft deletes.
   * 
   * Default: deleted
   */
  excludeKey?: string;

  /**
   * If a value is provided it is used for the exclude key.
   * Otherwise Date.now() is used.
   */
  excludeValue?: () => string | boolean | number | Date | object;

}
