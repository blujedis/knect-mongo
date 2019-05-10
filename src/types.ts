import {
  FilterQuery, UpdateQuery, ObjectID, FindOneOptions, DeleteWriteOpResultObject,
  Db, MongoClient, InsertWriteOpResult, UpdateWriteOpResult, InsertOneWriteOpResult
} from 'mongodb';
import { ObjectSchema } from 'yup';

export type LikeObjectID = string | number | ObjectID;

export type HookHandler<T = any> = (context: IHookContext<T>) => Promise<IHookContext<T>>;

export type HookTypes = keyof IHookConfig;

export type AwaiterResponse<T = any, K extends string = 'data'> = Promise<{ err?: Error } & Record<K, T>>;

export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

export interface IConstructor<T = any> {
  new(...args: any[]): T;
}

export interface ICascadeResult<T = any> {
  doc: T,
  ops: {
    [key: string]: DeleteWriteOpResultObject[];
  }
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
  opts: T[];
}

export interface IInsertOneWriteOpResult<T> extends InsertOneWriteOpResult {
  opts: T[];
}

// Re-export Mongodb Types.
export {
  Db,
  MongoClient
};
