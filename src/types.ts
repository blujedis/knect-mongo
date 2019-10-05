import {
  ObjectId, FindOneOptions, DeleteWriteOpResultObject,
  Db, MongoClient
} from 'mongodb';

import { ObjectSchema } from 'yup';

export type LikeObjectId = string | number | ObjectId;

export type Constructor<T = any> = new(...args: any[]) => T;

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

// Re-export Mongodb Types.
export {
  Db,
  MongoClient
};


// export type HookHandler<T = any> = (context: IHookContext<T>) => Promise<IHookContext<T>>;

// export type HookTypes = keyof IHookConfig;

// export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

// export interface IHookContext<T = any> {
//   filter?: FilterQuery<T>;
//   doc?: T | T[];
//   update?: UpdateQuery<T> | T;
//   options?: any;
// }

// export interface IHookConfig {
//   pre?: HookHandler;
//   post?: HookHandler;
// }

// export interface IHooks {
//   [key: string]: IHookConfig;
// }