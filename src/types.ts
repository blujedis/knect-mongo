import { FilterQuery, UpdateQuery } from 'mongodb';

export type HookHandler<T = any> = (context: IHookContext<T>) => Promise<IHookContext<T>>;

export type Constructor<T> = new (...args: any[]) => T;

export type HookTypes = keyof IHookConfig;

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

export interface ISchemaBase {

}