
import { Db, Collection, UpdateOneOptions, CommonOptions, FilterQuery, UpdateQuery, InsertOneWriteOpResult, InsertWriteOpResult, UpdateWriteOpResult, UpdateManyOptions, CollectionInsertOneOptions, CollectionInsertManyOptions, FindOneOptions, DeleteWriteOpResultObject, MongoClient } from 'mongodb';
import { KnectMongo } from './knect';
import * as JOI from 'joi';
import { awaiter } from './utils';
import { IHooks, HookTypes, PreHandler, PostHandler } from './types';

/**
 * Abstract schema class that must be extended 
 * for each model to be created.
 */
export abstract class Model<T = any> {

  // OVERRIDDEN IN KNECT.model //

  static collection: Collection;
  static knect: KnectMongo;
  static schema: any; // use any here, user may override not use JOI.
  static defaults: any;
  static onError: (err: Error) => void;

  // VALIDATION, PRE & POST HOOKS //

  private static hooks: IHooks = {};

  private static setHook(method: string, type: HookTypes, handler: any) {
    this.hooks[method] = this.hooks[method] || {};
    this.hooks[method][type] = handler;
  }

  private static getHooks(method: string) {
    const hooks = this.hooks[method];
    if (hooks)
      return hooks;
    this.onError(new Error(`Failed to lookup hooks for method "${method}"`));
  }

  private static getHook(method: string, type: HookTypes) {
    this.hooks[method] = this.hooks[method] || {};
    const hook = this.getHooks[method][type];
    if (hook)
      return hook;
    this.onError(new Error(`Failed to lookup hook type "${type}" for method "${method}"`));
  }

  static pre<T = any>(method: string, handler: PreHandler<T>) {
    this.setHook(method, 'pre', handler);
  }

  static post<T = any>(method: string, handler: PostHandler<T>) {
    this.setHook(method, 'post', handler);
  }

  static validate<T = any>(doc: T, schema?: JOI.ObjectSchema) {
    schema = (schema || Model.schema || JOI.object()) as JOI.ObjectSchema;
    return schema.validate<T>(doc);
  }

  static async find<T = any>(filter: FilterQuery<T>, options?: FindOneOptions) {

    let result;

    const hooks = this.getHooks('find');

    if (Object.keys(filter).length === 1 && (filter as any)._id)
      result = await awaiter(this.collection.findOne(filter, options));

    else
      result = { err: null, data: this.collection.find(filter).toArray() };

    if (result.err)
      return this.onError(result.err);

    return result.data;

  }

  static async create<T = any>(doc: T, options?: CollectionInsertOneOptions): Promise<InsertOneWriteOpResult>;
  static async create<T = any>(doc: T[], options?: CollectionInsertManyOptions): Promise<InsertWriteOpResult>;
  static async create<T = any>(doc: T | T[], options?: CollectionInsertOneOptions | CollectionInsertManyOptions) {

    let result;

    if (Array.isArray(doc))
      result = await awaiter(this.collection.insertMany(doc, options));

    else
      result = await awaiter(this.collection.insertOne(doc, options));

    if (!result.err)
      return result.data;

    this.onError(result.err);

  }

  static async update<T = any>(filter: FilterQuery<T>, update: UpdateQuery<T> | T, options?: UpdateOneOptions): Promise<UpdateWriteOpResult>;
  static async update<T = any>(filter: FilterQuery<T>, update: UpdateQuery<T> | T, options?: UpdateManyOptions): Promise<UpdateWriteOpResult>;
  static async update<T = any>(filter: FilterQuery<T>, update: UpdateQuery<T> | T, options?: UpdateOneOptions | UpdateManyOptions) {

    let result;

    update = !(update as UpdateQuery<T>).$set ? update = { $set: update } : update;

    if (Object.keys(filter).length === 1 && (filter as any)._id)
      result = await awaiter(this.collection.updateOne(filter, update, options));

    else
      result = await awaiter(this.collection.updateMany(filter, update, options));

    if (!result.err)
      return result.data;

    this.onError(result.err);

  }

  static async delete<T = any>(filter: FilterQuery<T>, options?: UpdateOneOptions): Promise<UpdateWriteOpResult> {

    let result;
    const date = Date.now();
    const data = { $set: { modified: date, deleted: date } };

    if (Object.keys(filter).length === 1 && (filter as any)._id)
      result = await awaiter(this.collection.updateOne(filter, data, options));

    else
      result = await awaiter(this.collection.updateMany(filter, data, options));

    if (!result.err)
      return result.data;

    this.onError(result.err);

  }

  static async purge<T = any>(filter: FilterQuery<T>, options?: CommonOptions): Promise<DeleteWriteOpResultObject> {

    let result;

    if (Object.keys(filter).length === 1 && (filter as any)._id)
      result = await awaiter(this.collection.deleteOne(filter, options));

    else
      result = await awaiter(this.collection.deleteMany(filter, options));

    if (!result.err)
      return result.data;

    this.onError(result.err);

  }

  // GLOBAL PROPERTIES //

  _id: string;
  created: number;
  modified: number;
  deleted: number;

  constructor(defaults?: any) {
    Model.defaults = defaults;
  }

  get ctx() {
    return this.constructor as any;
  }

  get id() {
    return this._id;
  }

  // DEFAULT CONVENIENCE METHODS //

  async save(options?: UpdateOneOptions): Promise<UpdateWriteOpResult> {

    const doc = Object.getOwnPropertyNames(this)
      .reduce((a, c) => {
        a[c] = this[c];
        return a;
      }, {} as T);

    const validation = Model.validate<T>(doc);

    if (!validation.error) {
      (doc as any).modified = Date.now();
      return await this.ctx.update({ _id: this.id }, validation.value, options);
    }

    this.ctx.onError(validation.error);

  }

  async delete(options?: UpdateOneOptions): Promise<DeleteWriteOpResultObject> {
    return await this.ctx.delete({ _id: this.id }, options);
  }

  async purge(options?: CommonOptions): Promise<DeleteWriteOpResultObject> {
    return await this.ctx.purge({ _id: this.id }, options);
  }

}

