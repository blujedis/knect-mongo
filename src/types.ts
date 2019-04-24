import { FilterQuery, UpdateQuery, ObjectID, FindOneOptions, DeleteWriteOpResultObject } from 'mongodb';
import { ObjectSchema } from 'yup';

export type LikeObjectID = string | number | ObjectID;

export type HookHandler<T = any> = (context: IHookContext<T>) => Promise<IHookContext<T>>;

export type Constructor<T = {}> = new (...args: any[]) => T;

export type HookTypes = keyof IHookConfig;

export type AwaiterResponse<T = any, K extends string = 'data'> = Promise<{ err?: Error } & Record<K, T>>;

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
  id?: LikeObjectID;
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
  props: ObjectSchema<T>;
  joins: IJoins;
}

export interface ISchemas {
  [key: string]: ISchema;
}

export interface IFindOneOptions extends FindOneOptions {
  populate?: string | string[];
}
