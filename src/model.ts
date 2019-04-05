
import { IHooks, Hooks, HookHandler } from './types';
import { Db, Collection, CollectionInsertOneOptions, UpdateOneOptions, CommonOptions } from 'mongodb';

export abstract class Model {

  private static hooks: IHooks = { pre: {}, post: {} };

  private static getHooks(type: string, method: Hooks) {
    const hooks = Model.hooks[type][method] || [];
  }

  private static hook(type: 'pre' | 'post', method: Hooks, handler: HookHandler) {
    this.hooks[type][method] = this.hooks[type][method] || [];
    this.hooks[type][method].push(handler);
  }

  static pre(method: Hooks, handler: HookHandler) {
    this.hook('pre', method, handler);
  }

  static post(method: Hooks, handler: HookHandler) {
    this.hook('post', method, handler);
  }

  _id: string;
  created: number;
  modified: number;
  deleted: number;

  constructor(props?: any) {
    for (const k in props) {
      this[k] = props[k];
    }
  }

  get db(): Db {
    return (this.constructor as any).db;
  }

  get collection(): Collection {
    return (this.constructor as any).collection;
  }

  async save(options?: UpdateOneOptions) {
    const doc = Object.getOwnPropertyNames(this)
      .reduce((a, c) => {
        a[c] = this[c];
        return a;
      }, {});
    return await this.collection.updateOne({ _id: this._id }, doc, options);
  }

  async delete(options?: UpdateOneOptions) {
    const date = Date.now();
    return await this.collection.updateOne({ _id: this._id }, { deleted: date, modified: date }, options);
  }

  async remove(options?: CommonOptions) {
    const date = Date.now();
    return await this.collection.deleteOne({ _id: this._id }, options);
  }

}

