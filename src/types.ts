import { FilterQuery, UpdateQuery } from 'mongodb';

export type PreHandler<T = any> = (context: IHookContext<T>) => Promise<IHookContext<T>>;
export type PostHandler<T = any> = (doc: T | T[]) => Promise<T | T[]>;

export type Constructor<T> = new (...args: any[]) => T;

export type HookTypes = keyof IHookConfig;

export interface IHookContext<T = any> {
  filter?: FilterQuery<T>;
  doc?: T | T[];
  update?: UpdateQuery<T> | T;
}

export interface IHookConfig {
  pre?: PreHandler;
  post?: PostHandler;
}

export interface IHooks {
  [key: string]: IHookConfig;
}