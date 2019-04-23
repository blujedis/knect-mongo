import {
  MongoClient, MongoClientOptions, Db, FilterQuery, UpdateOneOptions,
  UpdateWriteOpResult, CommonOptions, DeleteWriteOpResultObject, UpdateQuery,
  UpdateManyOptions, CollectionInsertOneOptions, CollectionInsertManyOptions,
  InsertWriteOpResult, InsertOneWriteOpResult, ObjectID,
} from 'mongodb';
import {
  IHooks, HookTypes, HookHandler, IBaseProps, ISchema, ISchemas,
  LikeObjectID, IFindOneOptions, IJoin, IJoins, ICascadeResult
} from './types';
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
  const str = uri.split('?')[0];
  if (!~str.indexOf('/'))
    return def;
  return str.split('/').pop();
}

export class KnectMongo {

  dbname: string;
  db: Db;
  client: MongoClient;

  schemas: ISchemas = {};

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
  model<S = any>(name: string, schema: ISchema) {

    const self = this;

    if (this.schemas[name])
      throw new Error(`Cannot create schema ${name}, the schema already exists`);

    this.schemas[name] = schema;

    type P = S & IBaseProps & { _id?: LikeObjectID };

    class Klass {

      protected static hooks: IHooks = {};

      static dbname = self.dbname;
      static collectionName = name;
      static schema = schema;

      static get client() {
        return self.client;
      }

      static get db() {
        return self.db;
      }

      static get collection() {
        return self.db.collection<P>(name);
      }

      protected static normalizeFilter(filter: FilterQuery<P>) {
        if (filter._id)
          filter._id = this.toObjectID(filter._id);
        return filter;
      }

      static onError(err: Error) {
        throw err;
      }

      static toObjectID(id: LikeObjectID): ObjectID;
      static toObjectID(ids: LikeObjectID[]): ObjectID[];
      static toObjectID(ids: LikeObjectID | LikeObjectID[]): ObjectID | ObjectID[] {

        const isArray = Array.isArray(ids);

        if (!isArray)
          ids = [ids] as any;

        const result = (ids as any).map(id => {
          if (typeof id === 'string' || typeof id === 'number')
            return new ObjectID(id);
          return id;
        }) as ObjectID[];

        if (isArray)
          return result;

        return result[0];

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

      static pre(method: string, handler: HookHandler<P>) {
        this.setHook(method, 'pre', handler);
      }

      static post(method: string, handler: HookHandler<P>) {
        this.setHook(method, 'post', handler);
      }

      static validate(doc: P, props?: JOI.ObjectSchema) {
        props = (this.schema.props || JOI.object()) as JOI.ObjectSchema;
        return props.validate<P>(doc);
      }

      static async populate<T extends P>(doc: P, joins: string[] | IJoins): Promise<T>;
      static async populate<T extends P>(doc: P[], joins: string[] | IJoins): Promise<T[]>;
      static async populate<T extends P>(doc: P, key: string, join: IJoin): Promise<T>;
      static async populate<T extends P>(doc: P[], key: string, join: IJoin): Promise<T[]>;
      static async populate<T extends P>(doc: P | P[], key: any, join?: IJoin): Promise<T | T[]> {

        let joins: IJoins = key;
        const isArray = Array.isArray(doc);

        if (arguments.length === 3)
          joins = { [key]: join };

        if (Array.isArray(key)) {
          joins = key.reduce((a, c) => {
            const j = this.schema.joins[c];
            if (j) a[c] = j;
            return a;
          }, {});
        }

        const docs = (!isArray ? [doc] : doc) as T[];

        const result = await Promise.all(docs.map(async d => {

          for (const k in joins) {

            if (joins.hasOwnProperty(k)) {

              const conf = joins[k];
              const prop = d[k];
              const filterKey = conf.key || '_id';
              let values = !Array.isArray(prop) ? [prop] : prop;

              if (filterKey === '_id')
                values = this.toObjectID(values);

              const filter = { [filterKey]: { '$in': values } };

              const rel = await this.db
                .collection(conf.collection)
                .find<T>(filter, conf.options)
                .toArray();

              d[k] = rel[0];

              if (Array.isArray(prop))
                d[k] = rel;

            }

          }

          return d;

        }));

        if (!isArray)
          return result[0];

        return result;

      }

      static async cascade(doc: P, joins: string[] | IJoins): Promise<ICascadeResult<P>>;
      static async cascade(doc: P[], joins: string[] | IJoins): Promise<ICascadeResult<P>[]>;
      static async cascade(doc: P, key: string, join: IJoin): Promise<ICascadeResult<P>>;
      static async cascade(doc: P[], key: string, join: IJoin): Promise<ICascadeResult<P>[]>;
      static async cascade(doc: P | P[], key: any, join?: IJoin): Promise<ICascadeResult<P> | ICascadeResult<P>[]> {

        let joins: IJoins = key;
        const isArray = Array.isArray(doc);

        if (arguments.length === 3)
          joins = { [key]: join };

        if (Array.isArray(key)) {
          joins = key.reduce((a, c) => {
            const j = this.schema.joins[c];
            if (j) a[c] = j;
            return a;
          }, {});
        }

        const docs = (!isArray ? [doc] : doc) as P[];

        const session = this.client.startSession();
        session.startTransaction();

        try {

          const result = await Promise.all(docs.map(async d => {

            let optKey: string;
            const ops: DeleteWriteOpResultObject[] = [];

            for (const k in joins) {

              if (joins.hasOwnProperty(k)) {

                optKey = k;

                const conf = joins[k];
                const prop = d[k];
                const filterKey = conf.key || '_id';
                let values = !Array.isArray(prop) ? [prop] : prop;

                if (filterKey === '_id')
                  values = this.toObjectID(values);

                const filter = { [filterKey]: { '$in': values } };

                const op = await this.db
                  .collection(conf.collection)
                  .deleteMany(filter, conf.options);

                ops.push(op);

              }

            }

            return { doc: d, ops: { [optKey]: ops } };

          }));

          await session.commitTransaction();
          session.endSession();

          if (!isArray)
            return result[0];

          return result;

        }
        catch (err) {

          await session.abortTransaction();
          session.endSession();

          throw err;

        }

      }

      static async find<T extends P>(filter?: FilterQuery<P>, options?: IFindOneOptions): Promise<T[]> {

        const hooks = this.getHooks('find');
        filter = filter || {};
        options = options || {};

        filter = this.normalizeFilter(filter);

        if (hooks.pre)
          await hooks.pre({ filter, options });

        const data = await this.collection.find<T>(filter, options).toArray();

        if (!options.populate)
          return data;

        if (typeof options.populate === 'string')
          options.populate = [options.populate];

        return this.populate(data, options.populate);

      }

      static async findOne<T extends P>(filter: FilterQuery<P>, options?: IFindOneOptions): Promise<T> {

        const hooks = this.getHooks('findOne');
        options = options || {};

        filter = this.normalizeFilter(filter);

        if (hooks.pre)
          await hooks.pre({ filter, options });

        const data = await this.collection.findOne<T>(filter, options);

        if (!options.populate)
          return data;

        if (typeof options.populate === 'string')
          options.populate = [options.populate];

        return this.populate(data, options.populate);

      }

      static async findById<T extends P>(id: LikeObjectID, options?: IFindOneOptions): Promise<T> {

        const hooks = this.getHooks('findById');
        options = options || {};

        const filter = { _id: this.toObjectID(id) };

        if (hooks.pre)
          await hooks.pre({ filter, options });

        const data = await this.collection.findOne<T>(filter, options);

        if (!options.populate)
          return data;

        if (typeof options.populate === 'string')
          options.populate = [options.populate];

        return this.populate(data, options.populate);

      }

      static async create(doc: P, options?: CollectionInsertOneOptions): Promise<InsertOneWriteOpResult>;
      static async create(doc: P[], options?: CollectionInsertManyOptions): Promise<InsertWriteOpResult>;
      static async create(doc: P | P[], options?: CollectionInsertOneOptions | CollectionInsertManyOptions) {

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

      static async update(filter: FilterQuery<P>, update: UpdateQuery<P> | P, options?: UpdateManyOptions) {

        const hooks = this.getHooks('update');

        filter = this.normalizeFilter(filter);

        update = !(update as any).$set ? update = { $set: update } : update as UpdateQuery<P>;

        const date = Date.now();

        update.$set.modified = update.$set.modified || date;

        if (hooks.pre)
          await hooks.pre({ filter, update, options });

        return this.collection.updateMany(filter, update, options);

      }

      static async updateOne(filter: FilterQuery<P>, update: UpdateQuery<P> | P, options?: UpdateOneOptions) {

        const hooks = this.getHooks('updateOne');

        filter = this.normalizeFilter(filter);

        update = !(update as any).$set ? update = { $set: update } : update as UpdateQuery<P>;

        const date = Date.now();

        update.$set.modified = update.$set.modified || date;

        if (hooks.pre)
          await hooks.pre({ filter, update, options });

        return this.collection.updateOne(filter, update, options);

      }

      static async updateById(id: LikeObjectID, update: UpdateQuery<P> | P, options?: UpdateOneOptions) {

        const hooks = this.getHooks('updateById');

        const filter = { _id: this.toObjectID(id) };

        update = !(update as any).$set ? update = { $set: update } : update as UpdateQuery<P>;

        const date = Date.now();

        update.$set.modified = update.$set.modified || date;

        if (hooks.pre)
          await hooks.pre({ filter, update, options });

        return this.collection.updateOne(filter, update, options);

      }

      static async delete(filter: FilterQuery<P>, options?: CommonOptions) {

        const hooks = this.getHooks('delete');

        filter = this.normalizeFilter(filter);

        if (hooks.pre)
          await hooks.pre({ filter, options });

        return this.collection.deleteMany(filter, options);

      }

      static async deleteOne(filter: FilterQuery<P>, options?: CommonOptions) {

        const hooks = this.getHooks('deleteOne');

        filter = this.normalizeFilter(filter);

        if (hooks.pre)
          await hooks.pre({ filter, options });

        return this.collection.deleteOne(filter, options);

      }

      static async deleteById(id: LikeObjectID, options?: CommonOptions) {

        const hooks = this.getHooks('deleteById');

        const filter = { _id: this.toObjectID(id) };

        if (hooks.pre)
          await hooks.pre({ filter, options });

        return this.collection.deleteOne(filter, options);

      }

      // CLASS PROPERTIES //

      private _id: LikeObjectID;

      created: number;
      modified: number;
      deleted: number;

      // CONSTRUCTOR //
      // May need to change this fine for now.
      constructor(props?: S) {
        Object.getOwnPropertyNames(props).forEach(k => this[k] = props[k]);
      }

      // CLASS GETTERS & SETTERS //

      private get _doc(): P {
        return Object.getOwnPropertyNames(this)
          .reduce((a, c) => {
            a[c] = this[c];
            return a;
          }, <any>{});
      }

      get id(): LikeObjectID {
        return this._id;
      }

      set id(id: LikeObjectID) {
        this._id = id;
      }

      // CLASS METHODS //

      /**
       * Saves the exiting instance to the database.
       * 
       * @param options MongoDB update options.
       */
      async save(options?: UpdateOneOptions) {

        options = options || {};
        options.upsert = false;

        this.modified = Date.now();

        const doc = this._doc;

        const validation = Klass.validate(doc);

        let id: ObjectID;
        let err: Error;

        // Save must have an id.
        if (!this.id)
          err = new Error(`Cannot save to collection "${name}" with
           missing id, did you mean ".create()"?`);

        id = Klass.toObjectID(this.id);

        return new Promise<UpdateWriteOpResult>((resolve, reject) => {

          if (err)
            return reject(err);

          resolve(Klass.updateById(id, validation.value, options));

        });

      }

      async create(options?: CollectionInsertOneOptions) {

        const date = Date.now();
        this.created = date;
        this.modified = date;

        let doc = this._doc;
        const validation = Klass.validate(doc);

        let err: Error;

        if (this.id)
          err = new Error(`Cannot create for collection with existing 
          id "${name}", did you mean ".save()"?`);

        return new Promise<InsertOneWriteOpResult>(async (resolve, reject) => {

          if (err)
            return reject(err);

          const result = await Klass.create(validation.value, options);

          doc = (result.ops && result.ops[0]) || {};

          Object.keys(doc).forEach(k => {
            if (k === '_id') {
              this.id = doc[k];
            }
            else if (typeof this[k] === 'undefined') {
              this[k] = doc[k];
            }
          });

          resolve(result);

        });

      }

      async delete(options?: CommonOptions) {
        return Klass.deleteById(Klass.toObjectID(this.id), options);
      }

      validate(props?: JOI.ObjectSchema) {
        return Klass.validate(this._doc, props);
      }

    }

    return Klass;

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
