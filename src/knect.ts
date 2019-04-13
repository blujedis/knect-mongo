import { MongoClient, MongoClientOptions, Db, FilterQuery, UpdateOneOptions, UpdateWriteOpResult, CommonOptions, DeleteWriteOpResultObject, UpdateQuery, UpdateManyOptions, CollectionInsertOneOptions, CollectionInsertManyOptions, InsertWriteOpResult, InsertOneWriteOpResult, FindOneOptions, ObjectID } from 'mongodb';
import { IHooks, HookTypes, HookHandler } from './types';
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

  /**
   * Accepts a schema and creates model with static and instance convenience methods.
   * 
   * @param name the name of the collection
   * @param schema the JOI Object Schema for validation.
   */
  model<S>(name: string, schema: JOI.ObjectSchema) {

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
        return self.db.collection<S>(name);
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

      static pre(method: string, handler: HookHandler<S>) {
        this.setHook(method, 'pre', handler);
      }

      static post(method: string, handler: HookHandler<S>) {
        this.setHook(method, 'post', handler);
      }

      static validate(doc: S, schema?: JOI.ObjectSchema) {
        schema = (schema || JOI.object()) as JOI.ObjectSchema;
        return schema.validate<S>(doc);
      }

      static async find(filter: FilterQuery<S>) {

        const hooks = this.getHooks('find');

        if (hooks.pre)
          await hooks.pre({ filter });

        const result = await awaiter<S[]>(this.collection.find(filter).toArray());

        if (!result.err)
          return result.data;

        this.onError(result.err);

      }

      static async findOne(filter: FilterQuery<S>, options?: FindOneOptions) {

        const hooks = this.getHooks('findOne');

        if (hooks.pre)
          await hooks.pre({ filter, options });

        const result = await awaiter<S>(this.collection.findOne(filter, options));

        if (!result.err)
          return result.data;

        this.onError(result.err);

      }

      static async create(doc: S, options?: CollectionInsertOneOptions): Promise<InsertOneWriteOpResult>;
      static async create(doc: S[], options?: CollectionInsertManyOptions): Promise<InsertWriteOpResult>;
      static async create(doc: S | S[], options?: CollectionInsertOneOptions | CollectionInsertManyOptions) {

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

      static async update(filter: FilterQuery<S>, update: UpdateQuery<S> | S, options?: UpdateManyOptions): Promise<UpdateWriteOpResult> {

        const hooks = this.getHooks('update');

        update = !(update as UpdateQuery<S>).$set ? update = { $set: update } : update;

        const date = Date.now();

        (update as any).$set.modified = date;

        if (hooks.pre)
          await hooks.pre({ filter, update, options });

        const result = await awaiter(this.collection.updateMany(filter, update, options));

        if (!result.err)
          return result.data;

        this.onError(result.err);

      }

      static async updateOne(filter: FilterQuery<S>, update: UpdateQuery<S> | S, options?: UpdateOneOptions): Promise<UpdateWriteOpResult> {

        const hooks = this.getHooks('updateOne');

        update = !(update as UpdateQuery<S>).$set ? update = { $set: update } : update;

        const date = Date.now();

        (update as any).$set.modified = date;

        if (hooks.pre)
          await hooks.pre({ filter, update, options });

        const result = await awaiter(this.collection.updateOne(filter, update, options));

        if (!result.err)
          return result.data;

        this.onError(result.err);

      }

      static async updateById(id: string, update: UpdateQuery<S> | S, options?: UpdateOneOptions): Promise<UpdateWriteOpResult> {

        const hooks = this.getHooks('updateById');

        const filter = { _id: id };

        update = !(update as UpdateQuery<S>).$set ? update = { $set: update } : update;

        const date = Date.now();

        (update as any).$set.modified = date;

        if (hooks.pre)
          await hooks.pre({ filter, update, options });

        const result = await awaiter(this.collection.updateOne(filter, update, options));

        if (!result.err)
          return result.data;

        this.onError(result.err);
      }

      static async delete(filter: FilterQuery<S>, options?: UpdateManyOptions): Promise<UpdateWriteOpResult> {

        const hooks = this.getHooks('delete');

        if (hooks.pre)
          await hooks.pre({ filter, options });

        const date = Date.now();
        const data = { $set: { modified: date, deleted: date } };

        const result = await awaiter(this.collection.updateMany(filter, data, options));

        if (!result.err)
          return result.data;

        this.onError(result.err);

      }

      static async deleteOne(filter: FilterQuery<S>, options?: UpdateOneOptions): Promise<UpdateWriteOpResult> {

        const hooks = this.getHooks('deleteOne');

        if (hooks.pre)
          await hooks.pre({ filter, options });

        const date = Date.now();
        const data = { $set: { modified: date, deleted: date } };

        const result = await awaiter(this.collection.updateOne(filter, data, options));

        if (!result.err)
          return result.data;

        this.onError(result.err);

      }

      static async deleteById(id: string, options?: UpdateOneOptions): Promise<UpdateWriteOpResult> {

        const hooks = this.getHooks('deleteOne');

        const filter = { _id: id };

        if (hooks.pre)
          await hooks.pre({ filter, options });

        const date = Date.now();
        const data = { $set: { modified: date, deleted: date } };

        const result = await awaiter(this.collection.updateOne(filter, data, options));

        if (!result.err)
          return result.data;

        this.onError(result.err);

      }

      static async purge(filter: FilterQuery<S>, options?: CommonOptions): Promise<DeleteWriteOpResultObject> {

        const hooks = this.getHooks('purge');

        if (hooks.pre)
          await hooks.pre({ filter, options });

        const result = await awaiter(this.collection.deleteMany(filter, options));

        if (!result.err)
          return result.data;

        this.onError(result.err);

      }

      static async purgeOne(filter: FilterQuery<S>, options?: CommonOptions): Promise<DeleteWriteOpResultObject> {

        const hooks = this.getHooks('purgeOne');

        if (hooks.pre)
          await hooks.pre({ filter, options });

        const result = await awaiter(this.collection.deleteOne(filter, options));

        if (!result.err)
          return result.data;

        this.onError(result.err);

      }

      static async purgeById(id: string, options?: CommonOptions): Promise<DeleteWriteOpResultObject> {

        const hooks = this.getHooks('purgeById');

        const filter = { _id: id };

        if (hooks.pre)
          await hooks.pre({ filter, options });

        const result = await awaiter(this.collection.deleteOne(filter, options));

        if (!result.err)
          return result.data;

        this.onError(result.err);

      }

      created: number;
      modified: number;
      deleted: number;

      constructor() {

        // Can't emit type defs and use private in derived class.
        Object.defineProperty(this, '_id', {
          enumerable: true,
          writable: true,
          configurable: true,
          value: undefined
        });

      }

      // DEFAULT CONVENIENCE METHODS //

      get doc() {

        return Object.getOwnPropertyNames(this)
          .reduce((a, c) => {
            a[c] = this[c];
            return a;
          }, {} as S);

      }

      get id(): string {
        return this['_id'];
      }

      set id(id: string) {
        this['_id'] = id;
      }

      /**
       * Saves the exiting instance to the database.
       * 
       * @param options MongoDB update options.
       */
      async save(options?: UpdateOneOptions): Promise<UpdateWriteOpResult> {

        options = options || {};
        options.upsert = false;

        const validation = (this.constructor as any).validate(this.doc);

        let id = this['_id'];

        // Save must have an id.
        if (!this['_id'])
          validation.error = new Error(`Cannot save to collection "${name}" with missing id, did you mean ".create()"?`);

        id = new ObjectID(id);
        delete validation.value._id;

        if (!validation.error) {
          (this.doc as any).modified = Date.now();
          return await (this.constructor as any).updateById(id, validation.value, options);
        }

        (this.constructor as any).onError(validation.error);

      }

      async create(options?: CollectionInsertOneOptions): Promise<InsertOneWriteOpResult> {

        const validation = (this.constructor as any).validate(this.doc);

        if (this['_id'])
          validation.error = new Error(`Cannot create for collection with existing id "${name}", did you mean ".save()"?`);

        if (!validation.error) {

          (this.doc as any).modified = Date.now();

          const result = await (this.constructor as any).create(validation.value, options);

          // If successfully created set the generated ID
          if (!result.err && (result.data as InsertOneWriteOpResult).insertedId)
            this.id = result.data.insertedId;

          return result;

        }

        (this.constructor as any).onError(validation.error);

      }

      async delete(options?: UpdateOneOptions): Promise<DeleteWriteOpResultObject> {
        return await (this.constructor as any).deleteById(new ObjectID(this['_id']), options);
      }

      async purge(options?: CommonOptions): Promise<DeleteWriteOpResultObject> {
        return await (this.constructor as any).purgeById(new ObjectID(this['_id']), options);
      }

      validate(schema?: JOI.ObjectSchema): JOI.ValidationResult<S> {
        return (this.constructor as any).validate(this.doc, schema);
      }

    }


  }

  /**
   * Sets the custom error handler function globally.
   * 
   * @param fn a custom error handler function.
   */
  onError(fn: (err: Error) => void) {
    this._onError = fn;
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
