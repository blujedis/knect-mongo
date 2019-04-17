import { MongoClient, MongoClientOptions, Db, FilterQuery, UpdateOneOptions, UpdateWriteOpResult, CommonOptions, DeleteWriteOpResultObject, UpdateQuery, UpdateManyOptions, CollectionInsertOneOptions, CollectionInsertManyOptions, InsertWriteOpResult, InsertOneWriteOpResult, FindOneOptions, ObjectID } from 'mongodb';
import { IHooks, HookTypes, HookHandler, IBaseProps } from './types';
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

export class KnectMongo {

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
  model<S extends IBaseProps>(name: string, schema: JOI.ObjectSchema) {

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

      static hooks: IHooks = {};

      static onError(err: Error) {
        throw err;
      }

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

        return this.collection.find(filter);

      }

      static async findOne(filter: FilterQuery<S>, options?: FindOneOptions) {

        const hooks = this.getHooks('findOne');

        if (hooks.pre)
          await hooks.pre({ filter, options });

        return this.collection.findOne(filter, options);

      }

      static async findById(id: string, options?: FindOneOptions) {

        const hooks = this.getHooks('findById');

        const filter = { _id: id };

        if (hooks.pre)
          await hooks.pre({ filter, options });

        return this.collection.findOne(filter, options);

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
            c.created = c.created || date;
            c.modified = c.modified || date;
            a.push(c);
            return a;
          }, []);
          return this.collection.insertMany(doc, options);
        }

        else {
          doc.created = doc.created || date;
          doc.modified = date;
          return this.collection.insertOne(doc, options);
        }

      }

      static async update(filter: FilterQuery<S>, update: UpdateQuery<S> | S, options?: UpdateManyOptions) {

        const hooks = this.getHooks('update');

        update = !(update as any).$set ? update = { $set: update } : update as UpdateQuery<S>;

        const date = Date.now();

        update.$set.modified = update.$set.modified || date;

        if (hooks.pre)
          await hooks.pre({ filter, update, options });

        return this.collection.updateMany(filter, update, options);


      }

      static async updateOne(filter: FilterQuery<S>, update: UpdateQuery<S> | S, options?: UpdateOneOptions) {

        const hooks = this.getHooks('updateOne');

        update = !(update as any).$set ? update = { $set: update } : update as UpdateQuery<S>;

        const date = Date.now();

        update.$set.modified = update.$set.modified || date;

        if (hooks.pre)
          await hooks.pre({ filter, update, options });

        return this.collection.updateOne(filter, update, options);

      }

      static async updateById(id: string, update: UpdateQuery<S> | S, options?: UpdateOneOptions) {

        const hooks = this.getHooks('updateById');

        const filter = { _id: id };

        update = !(update as any).$set ? update = { $set: update } : update as UpdateQuery<S>;

        const date = Date.now();

        update.$set.modified = update.$set.modified || date;

        if (hooks.pre)
          await hooks.pre({ filter, update, options });

        return this.collection.updateOne(filter, update, options);

      }

      static async delete(filter: FilterQuery<S>): Promise<UpdateWriteOpResult>;
      static async delete(filter: FilterQuery<S>, options: UpdateManyOptions): Promise<UpdateWriteOpResult>;
      static async delete(filter: FilterQuery<S>, date: number, options?: UpdateManyOptions): Promise<UpdateWriteOpResult>;
      static async delete(filter: FilterQuery<S>, date?: number | UpdateManyOptions, options?: UpdateManyOptions) {

        if (date && typeof date !== 'number') {
          options = date;
          date = undefined;
        }

        const hooks = this.getHooks('delete');

        date = date || Date.now();

        if (hooks.pre)
          await hooks.pre({ filter, options });

        const data = { $set: { modified: date, deleted: date } };

        return this.collection.updateMany(filter, data, options);


      }

      static async deleteOne(filter: FilterQuery<S>): Promise<UpdateWriteOpResult>;
      static async deleteOne(filter: FilterQuery<S>, options: UpdateOneOptions): Promise<UpdateWriteOpResult>;
      static async deleteOne(filter: FilterQuery<S>, date: number, options?: UpdateOneOptions): Promise<UpdateWriteOpResult>;
      static async deleteOne(filter: FilterQuery<S>, date?: number | UpdateOneOptions, options?: UpdateOneOptions) {

        const hooks = this.getHooks('deleteOne');

        if (hooks.pre)
          await hooks.pre({ filter, options });

        date = date || Date.now();
        const data = { $set: { modified: date, deleted: date } };

        return this.collection.updateOne(filter, data, options);

      }

      static async deleteById(id: string, options?: UpdateOneOptions) {

        const hooks = this.getHooks('deleteOne');

        const filter = { _id: id };

        if (hooks.pre)
          await hooks.pre({ filter, options });

        const date = Date.now();
        const data = { $set: { modified: date, deleted: date } };

        return this.collection.updateOne(filter, data, options);

      }

      static async purge(filter: FilterQuery<S>, options?: CommonOptions) {

        const hooks = this.getHooks('purge');

        if (hooks.pre)
          await hooks.pre({ filter, options });

        return this.collection.deleteMany(filter, options);

      }

      static async purgeOne(filter: FilterQuery<S>, options?: CommonOptions) {

        const hooks = this.getHooks('purgeOne');

        if (hooks.pre)
          await hooks.pre({ filter, options });

        return this.collection.deleteOne(filter, options);

      }

      static async purgeById(id: string, options?: CommonOptions) {

        const hooks = this.getHooks('purgeById');

        const filter = { _id: id };

        if (hooks.pre)
          await hooks.pre({ filter, options });

        return this.collection.deleteOne(filter, options);

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

      get doc(): S {

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

        this.modified = Date.now();

        const doc = this.doc;

        const validation = (this.constructor as any).validate(doc);

        let id = this['_id'];

        // Save must have an id.
        if (!this['_id'])
          validation.error = new Error(`Cannot save to collection "${name}" with missing id, did you mean ".create()"?`);

        id = new ObjectID(id);
        delete validation.value._id;

        if (!validation.error)
          return await (this.constructor as any).updateById(id, validation.value, options);

        (this.constructor as any).onError(validation.error);

      }

      async create(options?: CollectionInsertOneOptions): Promise<InsertOneWriteOpResult> {

        const date = Date.now();
        this.created = date;
        this.modified = date;

        const doc = this.doc;

        const validation = (this.constructor as any).validate(doc);

        if (this['_id'])
          validation.error = new Error(`Cannot create for collection with existing id "${name}", did you mean ".save()"?`);

        if (!validation.error) {

          const result = await awaiter((this.constructor as any).create(validation.value, options));

          // If successfully created set the generated ID
          if (!result.err && (result.data as InsertOneWriteOpResult).insertedId)
            this.id = result.data.insertedId;

          return result.data;

        }

        (this.constructor as any).onError(validation.error);

      }

      async delete(options?: UpdateOneOptions): Promise<DeleteWriteOpResultObject> {
        return (this.constructor as any).deleteById(new ObjectID(this['_id']), options);
      }

      async purge(options?: CommonOptions): Promise<DeleteWriteOpResultObject> {
        return (this.constructor as any).purgeById(new ObjectID(this['_id']), options);
      }

      validate(schema?: JOI.ObjectSchema): JOI.ValidationResult<S> {
        return (this.constructor as any).validate(this.doc, schema);
      }

    }


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
