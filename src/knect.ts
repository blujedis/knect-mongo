import { MongoClient, MongoClientOptions, Db, FilterQuery, UpdateOneOptions, UpdateWriteOpResult, CommonOptions, DeleteWriteOpResultObject, UpdateQuery, UpdateManyOptions, CollectionInsertOneOptions, CollectionInsertManyOptions, InsertWriteOpResult, InsertOneWriteOpResult, FindOneOptions } from 'mongodb';
import { Constructor, IHooks, HookTypes, HookHandler } from './types';
import { awaiter } from './utils';
import * as JOI from 'joi';

export const MONGO_CLIENT_DEFAULTS = {
  useNewUrlParser: true
};

/**
 * Parses database name from Mongodb connection string.
 * 
 * @param uri the Mongodb uri connection string.
 * @param def the default database name when not found in uri.
 */
function parseDbName(uri: string, def: string = '') {
  let str = uri.split('?')[0];
  if (!~str.indexOf('/'))
    return def;
  return str.split('/').pop();
}

/**
 * Default error handler.
 * 
 * @param err the error passed.
 */
function errorHandler(err: Error) {
  throw err;
}

export class KnectMongo {

  private _onError: (err: Error) => void = errorHandler;

  dbname: string;
  db: Db;
  client: MongoClient;

  /**
   * Connects to Mongodb instance.
   * 
   * @param uri the Mongodb connection uri.
   * @param options Mongodb client connection options.
   */
  async connect(uri: string, options?: MongoClientOptions) {

    if (this.db) return this.db;

    options = { ...MONGO_CLIENT_DEFAULTS, ...options };

    this.dbname = parseDbName(uri);

    this.client = await MongoClient.connect(uri, options);

    this.db = this.client.db(this.dbname);

    return this.db;

  }

  model<T>(name: string, schema: JOI.ObjectSchema) {

    const self = this;

    return class {

      static dbname = self.dbname;
      static collectionName = name;
      static schema: JOI.ObjectSchema = schema;

      static get client() {
        return self.client;
      }

      static get db() {
        return self.db;
      }

      static get collection() {
        return self.db.collection<T>(name);
      }

      static onError(err: Error) {
        self._onError(err);
      }

      static hooks: IHooks = {};

      static setHook(method: string, type: HookTypes, handler: any) {
        this.hooks[method] = this.hooks[method] || {};
        this.hooks[method][type] = handler;
      }

      static getHooks(method: string) {
        return this.hooks[method] || {};
      }

      static getHook(method: string, type: HookTypes) {
        this.hooks[method] = this.hooks[method] || {};
        const hook = this.getHooks[method][type];
        if (hook)
          return hook;
        this.onError(new Error(`Failed to lookup hook type "${type}" for method "${method}"`));
      }

      static pre(method: string, handler: HookHandler<T>) {
        this.setHook(method, 'pre', handler);
      }

      static post(method: string, handler: HookHandler<T>) {
        this.setHook(method, 'post', handler);
      }

      static validate(doc: T, schema?: JOI.ObjectSchema) {
        schema = (schema || JOI.object()) as JOI.ObjectSchema;
        return schema.validate<T>(doc);
      }

      static async find(filter: FilterQuery<T>, options?: FindOneOptions) {

        let result;

        const hooks = this.getHooks('find');

        if (hooks.pre)
          await hooks.pre({ filter, options });

        if (Object.keys(filter).length === 1 && (filter as any)._id)
          result = await awaiter(this.collection.findOne(filter, options));

        else
          result = { err: null, data: this.collection.find(filter).toArray() };

        if (result.err)
          return this.onError(result.err);

        return result.data;

      }

      static async create(doc: T, options?: CollectionInsertOneOptions): Promise<InsertOneWriteOpResult>;
      static async create(doc: T[], options?: CollectionInsertManyOptions): Promise<InsertWriteOpResult>;
      static async create(doc: T | T[], options?: CollectionInsertOneOptions | CollectionInsertManyOptions) {

        let result;

        const hooks = this.getHooks('create');

        if (hooks.pre)
          await hooks.pre({ doc, options });

        const date = Date.now();

        if (Array.isArray(doc)) {
          doc.reduce((a, c) => {
            (c as any).created = date;
            (c as any).modified = date;
            a.push(c);
            return a;
          }, []);
          result = await awaiter(this.collection.insertMany(doc, options));
        }

        else {
          (doc as any).created = date;
          (doc as any).modified = date;
          result = await awaiter(this.collection.insertOne(doc, options));
        }

        if (!result.err)
          return result.data;

        this.onError(result.err);

      }

      static async update(filter: FilterQuery<T>, update: UpdateQuery<T> | T, options?: UpdateOneOptions): Promise<UpdateWriteOpResult>;
      static async update(filter: FilterQuery<T>, update: UpdateQuery<T> | T, options?: UpdateManyOptions): Promise<UpdateWriteOpResult>;
      static async update(filter: FilterQuery<T>, update: UpdateQuery<T> | T, options?: UpdateOneOptions | UpdateManyOptions) {

        let result;

        const hooks = this.getHooks('update');

        update = !(update as UpdateQuery<T>).$set ? update = { $set: update } : update;

        if (hooks.pre)
          await hooks.pre({ filter, update, options });

        // @ts-ignore
        (update as UpdateQuery<T>).$set.modified = Date.now();

        if (Object.keys(filter).length === 1 && (filter as any)._id)
          result = await awaiter(this.collection.updateOne(filter, update, options));

        else
          result = await awaiter(this.collection.updateMany(filter, update, options));

        if (!result.err)
          return result.data;

        this.onError(result.err);

      }

      static async delete(filter: FilterQuery<T>, options?: UpdateOneOptions): Promise<UpdateWriteOpResult> {

        let result;

        const hooks = this.getHooks('delete');

        if (hooks.pre)
          await hooks.pre({ filter, options });

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

      static async purge(filter: FilterQuery<T>, options?: CommonOptions): Promise<DeleteWriteOpResultObject> {

        let result;

        const hooks = this.getHooks('purge');

        if (hooks.pre)
          await hooks.pre({ filter, options });

        if (Object.keys(filter).length === 1 && (filter as any)._id)
          result = await awaiter(this.collection.deleteOne(filter, options));

        else
          result = await awaiter(this.collection.deleteMany(filter, options));

        if (!result.err)
          return result.data;

        this.onError(result.err);

      }

      _id: string;
      created: number;
      modified: number;
      deleted: number;

      get ctor() {
        return this.constructor as any;
      }

      // DEFAULT CONVENIENCE METHODS //

      async save(options?: UpdateOneOptions): Promise<UpdateWriteOpResult> {

        options = options || {};
        options.upsert = false;

        const doc = Object.getOwnPropertyNames(this)
          .reduce((a, c) => {
            a[c] = this[c];
            return a;
          }, {} as T);

        const validation = this.ctor.validate(doc);

        if (!validation.error) {
          (doc as any).modified = Date.now();
          return await this.ctor.update({ _id: this._id }, validation.value, options);
        }

        this.ctor.onError(validation.error);

      }

      async create(options?: CollectionInsertOneOptions): Promise<InsertOneWriteOpResult> {

        const doc = Object.getOwnPropertyNames(this)
          .reduce((a, c) => {
            a[c] = this[c];
            return a;
          }, {} as T);

        const validation = this.ctor.validate(doc);

        if (!validation.error) {
          (doc as any).modified = Date.now();
          return await this.ctor.create(validation.value, options);
        }

        this.ctor.onError(validation.error);

      }

      async delete(options?: UpdateOneOptions): Promise<DeleteWriteOpResultObject> {
        return await this.ctor.delete({ _id: this._id }, options);
      }

      async purge(options?: CommonOptions): Promise<DeleteWriteOpResultObject> {
        return await this.ctor.purge({ _id: this._id }, options);
      }

    }


  }

  /**
   * Sets the custom error handler function.
   * 
   * @param fn a custom error handler function.
   */
  onError(err: Error): void {
    this._onError(err);
  }

}

let _instance: KnectMongo;

/**
 * Gets singleton instance of KnectMongo
 */
function getInstance() {
  if (!_instance)
    _instance = new KnectMongo();
  return _instance;
}

export default getInstance();
