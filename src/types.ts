

export type HookNextHandler = (err?: Error) => void;

export type HookHandler<T = any> = (document?: T, next?: HookNextHandler) => Promise<any>;

export type ValidateHandler = () => Promise<any>;

export type Constructor<T> = new (...args: any[]) => T;

export interface IHookConfig {
  '*': HookHandler;
  [key: string]: HookHandler;
}

export interface IHooks {
  validate: IHookConfig;
  pre: IHookConfig;
  post: IHookConfig;
}

export type Hooks = keyof IHookConfig;

